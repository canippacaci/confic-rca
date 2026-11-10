#!/usr/bin/env python3
"""
ConfIC-RCA: Full Reproduction & Experiment Runner
Executes the Conformal Calibration and Generates the Official Paper Figures & Metrics.

Paper: ConfIC-RCA: Statistically Grounded Efficient Estimation of Segmentation Quality
Authors: M. Cosarinsky, R. Billot, L. Mansilla, G. Jimenez, N. Gaggion, G. Fu, T. Tirer, E. Ferrante
Reference: IEEE Transactions on Medical Imaging / arXiv:2503.04522
"""

import os
import sys
import json
import argparse
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import ks_2samp, pearsonr

def clean_json_read(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    # Replace Infinity / NaN with numeric values
    text = text.replace('Infinity', '999.0').replace('NaN', '0.0')
    return json.loads(text)

def process_dataset_json(data, metric='Dice'):
    real_scores = []
    rca_scores = []
    for x in data:
        real = x.get('Real score', {}).get(metric, 0.0)
        rca_list = x.get('RCA score', {}).get(metric, [])

        if isinstance(real, list):
            real = real[0]
        if not np.isfinite(real):
            continue

        flat_rca = []
        for v in rca_list:
            if isinstance(v, list):
                flat_rca.append(v[0])
            elif np.isfinite(v):
                flat_rca.append(v)

        if len(flat_rca) == 0:
            continue

        real_scores.append(float(real))
        rca_scores.append(flat_rca)

    return {'Real score': np.array(real_scores), 'RCA score': rca_scores}

def quantile_band_asymm(arr, p_l, p_h):
    """Asymmetric raw band: [p_l, p_h] quantiles of arr."""
    lo, hi = np.percentile(arr, [p_l * 100, p_h * 100])
    return lo, hi

def quantile_calibrate(dataset_dict, p_l=0.30, p_h=0.90, alpha=0.10, n=8):
    real_cal = np.array(dataset_dict['cal']['Real score'])
    real_test = np.array(dataset_dict['test']['Real score'])
    rca_cal = [sample[:n] for sample in dataset_dict['cal']['RCA score']]
    rca_test = [sample[:n] for sample in dataset_dict['test']['RCA score']]

    # 1. Nonconformity on calibration set: s_j = max(lo - y, y - hi)
    S_cal = []
    for y, rca in zip(real_cal, rca_cal):
        if len(rca) == 0:
            continue
        lo, hi = quantile_band_asymm(rca, p_l, p_h)
        S_cal.append(max(lo - y, y - hi))

    S_cal = np.array(S_cal)
    N = len(S_cal)
    # Higher method quantile
    q_rank = int(np.ceil((N + 1) * (1.0 - alpha)))
    q_rank = min(N, max(1, q_rank))
    sorted_S_cal = np.sort(S_cal)
    qhat = sorted_S_cal[q_rank - 1]

    # 2. Evaluation on test set
    intervals = []
    preds = []
    S_test = []
    covered = 0
    total_width = 0.0

    for y, rca in zip(real_test, rca_test):
        if len(rca) == 0:
            continue
        lo, hi = quantile_band_asymm(rca, p_l, p_h)
        lb = max(0.0, lo - qhat)
        ub = min(1.0, hi + qhat)
        intervals.append((lb, ub))
        point_pred = float(np.mean(rca))
        preds.append(point_pred)
        S_test.append(max(lo - y, y - hi))

        is_cov = (y >= lb) and (y <= ub)
        if is_cov:
            covered += 1
        total_width += (ub - lb)

    n_test = len(intervals)
    empirical_coverage = (covered / n_test * 100.0) if n_test > 0 else 0.0
    avg_width = (total_width / n_test) if n_test > 0 else 0.0

    return {
        'intervals': intervals,
        'y_cal': real_cal,
        'y_test': real_test,
        'y_hat': preds,
        'scores': S_cal,
        'test_scores': np.array(S_test),
        'q': qhat,
        'coverage': empirical_coverage,
        'avg_width': avg_width,
        'n_cal': N,
        'n_test': n_test,
        'violations': n_test - covered
    }

def run_synthetic_exchangeability_experiment(output_dir):
    """Replicates Appendix B & Figure 9 from the paper."""
    print("\n[+] Running Appendix B Controlled Exchangeability Experiment (Figure 9)...")
    np.random.seed(42)
    n_cal = 1000
    n_test = 1000
    n_rca = 32
    noise_std = 0.10

    # True dice from Beta(2, 2)
    real_cal = np.random.beta(2, 2, size=n_cal)
    real_test = np.random.beta(2, 2, size=n_test)

    # Simulated RCA scores with noise
    rca_cal = np.clip(real_cal[:, None] + np.random.normal(0, noise_std, size=(n_cal, n_rca)), 0, 1)
    rca_test = np.clip(real_test[:, None] + np.random.normal(0, noise_std, size=(n_test, n_rca)), 0, 1)

    ds_dict = {
        'cal': {'Real score': real_cal, 'RCA score': [list(r) for r in rca_cal]},
        'test': {'Real score': real_test, 'RCA score': [list(r) for r in rca_test]},
    }

    res = quantile_calibrate(ds_dict, p_l=0.30, p_h=0.90, alpha=0.10, n=32)

    ks_stat, ks_pval = ks_2samp(res['scores'], res['test_scores'])

    # Plot figure 9
    plt.figure(figsize=(8, 5))
    sns.kdeplot(res['scores'], fill=True, color='orange', label=f"Calibration (≤ q̂: {np.mean(res['scores'] <= res['q']):.2f})", alpha=0.5)
    sns.kdeplot(res['test_scores'], fill=True, color='blue', label=f"Test (≤ q̂: {np.mean(res['test_scores'] <= res['q']):.2f})", alpha=0.4)
    plt.axvline(res['q'], color='blue', linestyle='--', linewidth=2, label=f"q̂ ({res['q']:.3f})")
    plt.title(f"ConfIC-RCA: Nonconformity Score Distributions (Figure 9 Reproduction)\nKS Stat: {ks_stat:.4f} (p={ks_pval:.3f}) | Empirical Coverage: {res['coverage']:.1f}%")
    plt.xlabel("Nonconformity Score s(x, y)")
    plt.ylabel("Density")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    out_path = os.path.join(output_dir, "figure_9_nonconformity_distribution.png")
    plt.savefig(out_path, dpi=200)
    plt.close()
    print(f"  -> Figure 9 saved to: {out_path}")
    print(f"  -> Empirical Coverage: {res['coverage']:.2f}% (Target: 90%)")
    print(f"  -> Average Interval Width: {res['avg_width']:.4f}")

def run_dataset_benchmark(results_dir, output_dir, p_l=0.30, p_h=0.90, alpha=0.10, n_ref=8):
    """Runs ConfIC-RCA across all 10 datasets and generates Table 1 and Figure 6 summary."""
    datasets = ['hc18', 'irca', 'isic 2018', 'jsrt', 'nucls', 'ph2', 'psfhs', 'scd', 'wbc_cv', 'wbc_jtsc']
    models = ['universeg', 'atlas-ra', 'atlas']

    print("\n" + "=" * 90)
    print(f"ConfIC-RCA: 10 DATASETS BENCHMARK EVALUATION (alpha={alpha}, pl={p_l}, ph={p_h}, k={n_ref})")
    print("=" * 90)
    print(f"{'Dataset':<14} {'Model':<12} {'N_cal':<8} {'N_test':<8} {'Threshold q̂':<14} {'Coverage (%)':<14} {'Avg Width':<12} {'Violations':<10}")
    print("-" * 90)

    summary_rows = []

    for ds in datasets:
        for model in models:
            cal_file = os.path.join(results_dir, model, f"{ds}_cal.json")
            test_file = os.path.join(results_dir, model, f"{ds}_test.json")

            if not os.path.exists(cal_file) or not os.path.exists(test_file):
                continue

            cal_data = clean_json_read(cal_file)
            test_data = clean_json_read(test_file)

            ds_dict = {
                'cal': process_dataset_json(cal_data),
                'test': process_dataset_json(test_data),
            }

            res = quantile_calibrate(ds_dict, p_l=p_l, p_h=p_h, alpha=alpha, n=n_ref)

            print(f"{ds:<14} {model:<12} {res['n_cal']:<8} {res['n_test']:<8} {res['q']:<14.4f} {res['coverage']:<14.2f} {res['avg_width']:<12.4f} {res['violations']:<10}")
            summary_rows.append({
                'dataset': ds,
                'model': model,
                'coverage': res['coverage'],
                'avg_width': res['avg_width'],
                'q': res['q'],
                'n_test': res['n_test'],
                'violations': res['violations']
            })

    # Plot Figure 6 Reproduction (Coverage and Interval Width Bar Chart)
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # Interval Widths
    ds_names = list(set(r['dataset'] for r in summary_rows))
    ds_names.sort()

    useg_widths = [next((r['avg_width'] for r in summary_rows if r['dataset'] == d and r['model'] == 'universeg'), 0) for d in ds_names]
    atlas_widths = [next((r['avg_width'] for r in summary_rows if r['dataset'] == d and r['model'] == 'atlas-ra'), 0) for d in ds_names]

    x = np.arange(len(ds_names))
    width = 0.35

    axes[0].bar(x - width/2, useg_widths, width, label='UniverSeg (ConfIC-RCA)', color='#0ea5e9')
    axes[0].bar(x + width/2, atlas_widths, width, label='Atlas-RA', color='#64748b')
    axes[0].set_ylabel('Average Interval Width (lower is better)')
    axes[0].set_title('Figure 6(a) Reproduction: Prediction Interval Width Across Datasets')
    axes[0].set_xticks(x)
    axes[0].set_xticklabels(ds_names, rotation=35, ha='right')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Coverage Rates
    useg_cov = [next((r['coverage'] for r in summary_rows if r['dataset'] == d and r['model'] == 'universeg'), 0) for d in ds_names]
    atlas_cov = [next((r['coverage'] for r in summary_rows if r['dataset'] == d and r['model'] == 'atlas-ra'), 0) for d in ds_names]

    axes[1].bar(x - width/2, useg_cov, width, label='UniverSeg (ConfIC-RCA)', color='#10b981')
    axes[1].bar(x + width/2, atlas_cov, width, label='Atlas-RA', color='#94a3b8')
    axes[1].axhline((1 - alpha) * 100, color='red', linestyle='--', label=f'Nominal Target ({(1 - alpha)*100:.0f}%)')
    axes[1].set_ylabel('Empirical Coverage % (higher is better)')
    axes[1].set_title('Figure 6(b) Reproduction: Empirical Coverage Rates Across Datasets')
    axes[1].set_xticks(x)
    axes[1].set_xticklabels(ds_names, rotation=35, ha='right')
    axes[1].set_ylim([70, 100])
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    chart_path = os.path.join(output_dir, "figure_6_benchmark_coverage_and_widths.png")
    plt.savefig(chart_path, dpi=200)
    plt.close()
    print(f"\n[+] Figure 6 Benchmark Chart saved to: {chart_path}")

def main():
    parser = argparse.ArgumentParser(description="ConfIC-RCA Paper Experiment Execution")
    parser.add_argument('--dataset', default=None, help="Run on specific dataset (e.g., jsrt, hc18)")
    parser.add_argument('--model', default='universeg', help="Model (universeg, atlas-ra, atlas)")
    parser.add_argument('--alpha', type=float, default=0.10, help="Alpha (0.10 = 90% confidence)")
    parser.add_argument('--pl', type=float, default=0.30, help="Lower quantile")
    parser.add_argument('--ph', type=float, default=0.90, help="Upper quantile")
    parser.add_argument('--n_ref', type=int, default=8, help="Number of retrieved reference cases")
    args = parser.parse_args()

    results_dir = os.path.join(os.path.dirname(__file__), 'upstream-repo', 'results')
    output_dir = os.path.join(os.path.dirname(__file__), 'paper_figures')
    os.makedirs(output_dir, exist_ok=True)

    if args.dataset:
        cal_file = os.path.join(results_dir, args.model, f"{args.dataset}_cal.json")
        test_file = os.path.join(results_dir, args.model, f"{args.dataset}_test.json")
        cal_data = clean_json_read(cal_file)
        test_data = clean_json_read(test_file)
        ds_dict = {
            'cal': process_dataset_json(cal_data),
            'test': process_dataset_json(test_data),
        }
        res = quantile_calibrate(ds_dict, p_l=args.pl, p_h=args.ph, alpha=args.alpha, n=args.n_ref)
        print(f"\nResults for {args.dataset} ({args.model}):")
        print(f"  Coverage:       {res['coverage']:.2f}% (Target: {(1-args.alpha)*100:.0f}%)")
        print(f"  Avg Width:      {res['avg_width']:.4f}")
        print(f"  Cutoff q̂:       {res['q']:.4f}")
        print(f"  Violations:     {res['violations']} / {res['n_test']}")
    else:
        # Run full benchmark and synthetic test
        run_synthetic_exchangeability_experiment(output_dir)
        run_dataset_benchmark(results_dir, output_dir, p_l=args.pl, p_h=args.ph, alpha=args.alpha, n_ref=args.n_ref)

if __name__ == '__main__':
    main()
