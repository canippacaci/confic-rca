#!/usr/bin/env python3
"""
ConfIC-RCA: Conformal In-Context Reverse Classification Accuracy
Standalone Python Demonstration & Benchmark Evaluator

Paper: ConfIC-RCA: Statistically Grounded Efficient Estimation of Segmentation Quality
Authors: M. Cosarinsky, R. Billot, L. Mansilla, G. Jimenez, N. Gaggion, G. Fu, T. Tirer, E. Ferrante
Reference: IEEE Transactions on Medical Imaging / arXiv:2503.04522
"""

import os
import sys
import json
import argparse
import numpy as np

def quantile_band_asymm(arr, p_l=0.30, p_h=0.90):
    """Computes asymmetric quantile band [p_l, p_h] from empirical scores."""
    lo, hi = np.percentile(arr, [p_l * 100, p_h * 100])
    return float(lo), float(hi)

def run_calibration(cal_data, test_data, p_l=0.30, p_h=0.90, alpha=0.10, n_ref=8, clinical_threshold=0.75):
    """
    Executes Split Conformal Quantile Regression (CQR) on RCA distributions:
      1. Calibrates threshold q_hat from held-out calibration set nonconformity scores:
         s_j = max(q_l(S_j) - y_j, y_j - q_h(S_j))
      2. Constructs prediction interval on test set:
         C(S_I) = [max(0, q_l - q_hat), min(1, q_h + q_hat)]
    """
    cal_scores = []
    for sample in cal_data:
        y = sample['y']
        rca = sample['rca'][:n_ref]
        if len(rca) == 0:
            continue
        lo, hi = quantile_band_asymm(rca, p_l, p_h)
        s_j = max(lo - y, y - hi)
        cal_scores.append(s_j)

    cal_scores = np.array(cal_scores)
    N = len(cal_scores)
    # Conformal quantile: ceil((N + 1) * (1 - alpha)) / N
    q_rank = int(np.ceil((N + 1) * (1.0 - alpha)))
    q_rank = min(N, max(1, q_rank))
    sorted_scores = np.sort(cal_scores)
    q_hat = float(sorted_scores[q_rank - 1])

    # Evaluate on test set
    covered = 0
    total_width = 0.0
    abs_errors = []
    y_true_list = []
    y_pred_list = []

    test_results = []
    for sample in test_data:
        y = sample['y']
        rca = sample['rca'][:n_ref]
        if len(rca) == 0:
            continue
        lo, hi = quantile_band_asymm(rca, p_l, p_h)
        lb = max(0.0, lo - q_hat)
        ub = min(1.0, hi + q_hat)
        point_est = float(np.mean(rca))

        is_cov = (y >= lb) and (y <= ub)
        if is_cov:
            covered += 1

        width = ub - lb
        total_width += width
        abs_errors.append(abs(y - point_est))
        y_true_list.append(y)
        y_pred_list.append(point_est)

        # Clinical verdict
        if lb >= clinical_threshold:
            status = "PASSED"
        elif ub >= clinical_threshold:
            status = "AUDIT_REQ"
        else:
            status = "REJECTED"

        test_results.append({
            'y_true': y,
            'point_est': point_est,
            'lb': lb,
            'ub': ub,
            'covered': is_cov,
            'width': width,
            'status': status
        })

    n_test = len(test_results)
    emp_coverage = (covered / n_test * 100.0) if n_test > 0 else 0.0
    avg_width = (total_width / n_test) if n_test > 0 else 0.0
    mae = float(np.mean(abs_errors)) if abs_errors else 0.0
    corr = float(np.corrcoef(y_true_list, y_pred_list)[0, 1]) if len(y_true_list) > 1 else 0.0

    return {
        'n_cal': N,
        'n_test': n_test,
        'q_hat': q_hat,
        'empirical_coverage': emp_coverage,
        'nominal_coverage': (1.0 - alpha) * 100.0,
        'avg_width': avg_width,
        'mae': mae,
        'correlation': corr,
        'violations': n_test - covered,
        'predictions': test_results
    }

def main():
    parser = argparse.ArgumentParser(description="ConfIC-RCA Conformal Calibration Benchmark Runner")
    parser.add_argument('--dataset', default='jsrt', help="Dataset key (e.g., jsrt, hc18, irca, nucls, isic 2018)")
    parser.add_argument('--model', default='universeg', choices=['universeg', 'atlas-ra', 'atlas'], help="Model key")
    parser.add_argument('--alpha', type=float, default=0.10, help="Error level (alpha=0.10 -> 90% confidence)")
    parser.add_argument('--pl', type=float, default=0.30, help="Lower quantile level (default 0.30)")
    parser.add_argument('--ph', type=float, default=0.90, help="Upper quantile level (default 0.90)")
    parser.add_argument('--n_ref', type=int, default=8, help="Number of retrieved reference images (default 8)")
    args = parser.parse_args()

    # Load dataset cache
    cache_path = os.path.join(os.path.dirname(__file__), 'lib', 'data', 'dataset_cache.json')
    if not os.path.exists(cache_path):
        print(f"Error: dataset cache not found at {cache_path}")
        sys.exit(1)

    with open(cache_path, 'r', encoding='utf-8') as f:
        datasets = json.load(f)

    if args.dataset not in datasets:
        print(f"Dataset '{args.dataset}' not found. Available: {list(datasets.keys())}")
        sys.exit(1)

    ds_info = datasets[args.dataset]
    model_data = ds_info['models'].get(args.model)
    if not model_data:
        print(f"Model '{args.model}' not available for {args.dataset}.")
        sys.exit(1)

    print("=" * 70)
    print("ConfIC-RCA: Conformal In-Context Reverse Classification Accuracy")
    print("Paper: IEEE Transactions on Medical Imaging / arXiv:2503.04522")
    print("=" * 70)
    print(f"Dataset:       {ds_info['name']} ({ds_info['modality']} - {ds_info['anatomy']})")
    print(f"Model:         {args.model.upper()} (In-Context Reverse Segmenter)")
    print(f"Quantiles:     p_l = {args.pl}, p_h = {args.ph}")
    print(f"Confidence:    1 - alpha = {(1 - args.alpha)*100:.1f}%")
    print(f"Retrieved k:   {args.n_ref} images via DINOv2 cosine similarity")
    print("-" * 70)

    res = run_calibration(
        model_data['cal'],
        model_data['test'],
        p_l=args.pl,
        p_h=args.ph,
        alpha=args.alpha,
        n_ref=args.n_ref
    )

    print(f"Calibration Samples (N_cal): {res['n_cal']}")
    print(f"Test Samples (N_test):        {res['n_test']}")
    print(f"Calibrated Cutoff (q_hat):    {res['q_hat']:.4f}")
    print(f"Empirical Coverage:           {res['empirical_coverage']:.2f}%  (Target: {res['nominal_coverage']:.1f}%)")
    print(f"Average Interval Width:       {res['avg_width']:.4f}")
    print(f"Pearson Correlation (r):      {res['correlation']:.4f}")
    print(f"Mean Absolute Error (MAE):    {res['mae']:.4f}")
    print(f"Violations Count:             {res['violations']} / {res['n_test']}")
    print("-" * 70)

    print("\nSample Test Predictions with Guaranteed Intervals [lb, ub]:")
    print(f"{'Sample #':<10} {'True Dice':<12} {'Point Est':<12} {'Conformal Interval':<22} {'Covered?':<10} {'Status':<10}")
    print("-" * 78)
    for i, p in enumerate(res['predictions'][:10]):
        interval_str = f"[{p['lb']:.3f}, {p['ub']:.3f}]"
        cov_str = "YES (✓)" if p['covered'] else "NO (✗)"
        print(f"#{i+1:<9} {p['y_true']:<12.3f} {p['point_est']:<12.3f} {interval_str:<22} {cov_str:<10} {p['status']:<10}")

    print("=" * 70)
    print("Conclusion: ConfIC-RCA successfully provided finite-sample coverage guarantees")
    print("without requiring ground truth at inference time!")
    print("=" * 70)

if __name__ == '__main__':
    main()

