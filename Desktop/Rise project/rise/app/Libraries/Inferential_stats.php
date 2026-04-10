<?php

namespace App\Libraries;

/**
 * Inferential statistics library — pure PHP.
 * Implements: t-test (1-sample, 2-sample, paired), ANOVA, chi-square, Mann-Whitney U.
 */
class Inferential_stats {

    /**
     * One-sample t-test: is the mean of $data significantly different from $mu?
     *
     * @param array $data Numeric array
     * @param float $mu The hypothesized population mean
     * @return array ['t' => float, 'df' => int, 'p' => float]
     */
    function t_test_one_sample($data, $mu) {
        $n = count($data);
        if ($n < 2) return array('t' => 0, 'df' => 0, 'p' => 1);

        $desc = new Descriptive_stats();
        $mean = $desc->mean($data);
        $sd = $desc->std_dev($data, true);
        if ($sd == 0) return array('t' => 0, 'df' => $n - 1, 'p' => 1);

        $t = ($mean - $mu) / ($sd / sqrt($n));
        $df = $n - 1;

        return array(
            't' => round($t, 4),
            'df' => $df,
            'p' => round($this->_t_to_p($t, $df), 6),
        );
    }

    /**
     * Independent two-sample t-test (Welch's t-test).
     *
     * @param array $data1 First sample
     * @param array $data2 Second sample
     * @return array ['t' => float, 'df' => float, 'p' => float]
     */
    function t_test_two_sample($data1, $data2) {
        $n1 = count($data1);
        $n2 = count($data2);
        if ($n1 < 2 || $n2 < 2) return array('t' => 0, 'df' => 0, 'p' => 1);

        $desc = new Descriptive_stats();
        $mean1 = $desc->mean($data1);
        $mean2 = $desc->mean($data2);
        $var1 = $desc->variance($data1, true);
        $var2 = $desc->variance($data2, true);

        $se = sqrt($var1 / $n1 + $var2 / $n2);
        if ($se == 0) return array('t' => 0, 'df' => $n1 + $n2 - 2, 'p' => 1);

        $t = ($mean1 - $mean2) / $se;

        // Welch-Satterthwaite degrees of freedom
        $df_num = pow($var1 / $n1 + $var2 / $n2, 2);
        $df_den = pow($var1 / $n1, 2) / ($n1 - 1) + pow($var2 / $n2, 2) / ($n2 - 1);
        $df = $df_den > 0 ? $df_num / $df_den : $n1 + $n2 - 2;

        return array(
            't' => round($t, 4),
            'df' => round($df, 2),
            'p' => round($this->_t_to_p($t, $df), 6),
        );
    }

    /**
     * Paired t-test.
     */
    function t_test_paired($data1, $data2) {
        $n = min(count($data1), count($data2));
        if ($n < 2) return array('t' => 0, 'df' => 0, 'p' => 1);

        $diffs = array();
        for ($i = 0; $i < $n; $i++) {
            $diffs[] = $data1[$i] - $data2[$i];
        }
        return $this->t_test_one_sample($diffs, 0);
    }

    /**
     * One-way ANOVA.
     *
     * @param array $groups Array of arrays, each being a group's data
     * @return array ['f' => float, 'df_between' => int, 'df_within' => int, 'p' => float]
     */
    function anova($groups) {
        $k = count($groups);
        if ($k < 2) return array('f' => 0, 'df_between' => 0, 'df_within' => 0, 'p' => 1);

        $desc = new Descriptive_stats();
        $all_data = array();
        $group_means = array();
        $group_sizes = array();
        foreach ($groups as $g) {
            $all_data = array_merge($all_data, $g);
            $group_means[] = $desc->mean($g);
            $group_sizes[] = count($g);
        }

        $grand_mean = $desc->mean($all_data);
        $n_total = count($all_data);

        // Sum of squares between groups
        $ss_between = 0;
        for ($i = 0; $i < $k; $i++) {
            $ss_between += $group_sizes[$i] * pow($group_means[$i] - $grand_mean, 2);
        }

        // Sum of squares within groups
        $ss_within = 0;
        for ($i = 0; $i < $k; $i++) {
            foreach ($groups[$i] as $val) {
                $ss_within += pow($val - $group_means[$i], 2);
            }
        }

        $df_between = $k - 1;
        $df_within = $n_total - $k;
        if ($df_within <= 0 || $ss_within == 0) {
            return array('f' => 0, 'df_between' => $df_between, 'df_within' => max(0, $df_within), 'p' => 1);
        }

        $ms_between = $ss_between / $df_between;
        $ms_within = $ss_within / $df_within;
        $f = $ms_between / $ms_within;

        return array(
            'f' => round($f, 4),
            'df_between' => $df_between,
            'df_within' => $df_within,
            'p' => round($this->_f_to_p($f, $df_between, $df_within), 6),
            'ss_between' => round($ss_between, 4),
            'ss_within' => round($ss_within, 4),
        );
    }

    /**
     * Chi-square test of independence.
     *
     * @param array $observed 2D array (contingency table)
     * @return array ['chi2' => float, 'df' => int, 'p' => float, 'cramers_v' => float]
     */
    function chi_square($observed) {
        $rows = count($observed);
        if ($rows < 2) return array('chi2' => 0, 'df' => 0, 'p' => 1, 'cramers_v' => 0);
        $cols = count($observed[0]);
        if ($cols < 2) return array('chi2' => 0, 'df' => 0, 'p' => 1, 'cramers_v' => 0);

        // Calculate row totals, column totals, and grand total
        $row_totals = array();
        $col_totals = array_fill(0, $cols, 0);
        $grand_total = 0;
        for ($i = 0; $i < $rows; $i++) {
            $row_totals[$i] = array_sum($observed[$i]);
            $grand_total += $row_totals[$i];
            for ($j = 0; $j < $cols; $j++) {
                $col_totals[$j] += $observed[$i][$j];
            }
        }

        if ($grand_total == 0) {
            return array('chi2' => 0, 'df' => 0, 'p' => 1, 'cramers_v' => 0);
        }

        // Chi-square statistic
        $chi2 = 0;
        for ($i = 0; $i < $rows; $i++) {
            for ($j = 0; $j < $cols; $j++) {
                $expected = ($row_totals[$i] * $col_totals[$j]) / $grand_total;
                if ($expected > 0) {
                    $chi2 += pow($observed[$i][$j] - $expected, 2) / $expected;
                }
            }
        }

        $df = ($rows - 1) * ($cols - 1);
        $min_dim = min($rows, $cols) - 1;
        $cramers_v = $min_dim > 0 ? sqrt($chi2 / ($grand_total * $min_dim)) : 0;

        return array(
            'chi2' => round($chi2, 4),
            'df' => $df,
            'p' => round($this->_chi2_to_p($chi2, $df), 6),
            'cramers_v' => round($cramers_v, 4),
        );
    }

    /**
     * Mann-Whitney U test (non-parametric).
     *
     * @param array $data1 First sample
     * @param array $data2 Second sample
     * @return array ['u' => float, 'z' => float, 'p' => float]
     */
    function mann_whitney_u($data1, $data2) {
        $n1 = count($data1);
        $n2 = count($data2);
        if ($n1 < 1 || $n2 < 1) return array('u' => 0, 'z' => 0, 'p' => 1);

        // Combine and rank
        $combined = array();
        foreach ($data1 as $v) $combined[] = array('value' => $v, 'group' => 1);
        foreach ($data2 as $v) $combined[] = array('value' => $v, 'group' => 2);
        usort($combined, function ($a, $b) { return $a['value'] <=> $b['value']; });

        // Assign ranks (with ties)
        $n = count($combined);
        $ranks = array_fill(0, $n, 0);
        $i = 0;
        while ($i < $n) {
            $j = $i;
            while ($j < $n - 1 && $combined[$j + 1]['value'] === $combined[$j]['value']) {
                $j++;
            }
            $avg_rank = ($i + $j) / 2.0 + 1;
            for ($k = $i; $k <= $j; $k++) {
                $ranks[$k] = $avg_rank;
            }
            $i = $j + 1;
        }

        $r1 = 0;
        for ($i = 0; $i < $n; $i++) {
            if ($combined[$i]['group'] === 1) {
                $r1 += $ranks[$i];
            }
        }

        $u1 = $r1 - ($n1 * ($n1 + 1)) / 2;
        $u2 = $n1 * $n2 - $u1;
        $u = min($u1, $u2);

        $mean_u = ($n1 * $n2) / 2;
        $sd_u = sqrt(($n1 * $n2 * ($n1 + $n2 + 1)) / 12);
        $z = $sd_u > 0 ? ($u - $mean_u) / $sd_u : 0;

        return array(
            'u' => round($u, 4),
            'z' => round($z, 4),
            'p' => round($this->_z_to_p($z), 6),
        );
    }

    /**
     * Approximate two-tailed p-value from t-distribution.
     * Uses the regularized incomplete beta function approximation.
     */
    private function _t_to_p($t, $df) {
        if ($df <= 0) return 1;
        $x = $df / ($df + $t * $t);
        return $this->_regularized_beta($x, $df / 2, 0.5);
    }

    /**
     * Approximate p-value from F-distribution.
     */
    private function _f_to_p($f, $df1, $df2) {
        if ($f <= 0 || $df1 <= 0 || $df2 <= 0) return 1;
        $x = $df2 / ($df2 + $df1 * $f);
        return $this->_regularized_beta($x, $df2 / 2, $df1 / 2);
    }

    /**
     * Approximate p-value from chi-square distribution.
     */
    private function _chi2_to_p($chi2, $df) {
        if ($chi2 <= 0 || $df <= 0) return 1;
        return $this->_regularized_gamma_q($df / 2, $chi2 / 2);
    }

    /**
     * Two-tailed p-value from z-score (standard normal).
     */
    private function _z_to_p($z) {
        return 2 * (1 - $this->_normal_cdf(abs($z)));
    }

    /**
     * Standard normal CDF approximation (Abramowitz & Stegun).
     */
    private function _normal_cdf($x) {
        $b1 = 0.319381530;
        $b2 = -0.356563782;
        $b3 = 1.781477937;
        $b4 = -1.821255978;
        $b5 = 1.330274429;
        $p = 0.2316419;

        $t = 1 / (1 + $p * abs($x));
        $z = (1 / sqrt(2 * M_PI)) * exp(-0.5 * $x * $x);
        $y = 1 - $z * ($b1 * $t + $b2 * pow($t, 2) + $b3 * pow($t, 3) + $b4 * pow($t, 4) + $b5 * pow($t, 5));

        return $x >= 0 ? $y : 1 - $y;
    }

    /**
     * Regularized incomplete beta function (series expansion).
     */
    private function _regularized_beta($x, $a, $b) {
        if ($x <= 0) return 0;
        if ($x >= 1) return 1;

        // Use continued fraction approximation
        $lbeta = $this->_log_beta($a, $b);
        $front = exp(log($x) * $a + log(1 - $x) * $b - $lbeta) / $a;

        // Modified Lentz's algorithm
        $f = 1;
        $c = 1;
        $d = 1 - ($a + $b) * $x / ($a + 1);
        if (abs($d) < 1e-30) $d = 1e-30;
        $d = 1 / $d;
        $f = $d;

        for ($m = 1; $m <= 200; $m++) {
            // Even step
            $numerator = $m * ($b - $m) * $x / (($a + 2 * $m - 1) * ($a + 2 * $m));
            $d = 1 + $numerator * $d;
            if (abs($d) < 1e-30) $d = 1e-30;
            $c = 1 + $numerator / $c;
            if (abs($c) < 1e-30) $c = 1e-30;
            $d = 1 / $d;
            $f *= $c * $d;

            // Odd step
            $numerator = -(($a + $m) * ($a + $b + $m) * $x) / (($a + 2 * $m) * ($a + 2 * $m + 1));
            $d = 1 + $numerator * $d;
            if (abs($d) < 1e-30) $d = 1e-30;
            $c = 1 + $numerator / $c;
            if (abs($c) < 1e-30) $c = 1e-30;
            $d = 1 / $d;
            $delta = $c * $d;
            $f *= $delta;

            if (abs($delta - 1) < 1e-10) break;
        }

        return $front * $f;
    }

    private function _log_beta($a, $b) {
        return $this->_log_gamma($a) + $this->_log_gamma($b) - $this->_log_gamma($a + $b);
    }

    /**
     * Stirling's approximation for log(Gamma(x)).
     */
    private function _log_gamma($x) {
        if ($x <= 0) return 0;
        // Lanczos approximation
        $cof = array(76.18009172947146, -86.50532032941677, 24.01409824083091,
                     -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5);
        $ser = 1.000000000190015;
        $y = $x;
        $tmp = $x + 5.5;
        $tmp -= ($x + 0.5) * log($tmp);
        foreach ($cof as $c) {
            $y += 1;
            $ser += $c / $y;
        }
        return -$tmp + log(2.5066282746310005 * $ser / $x);
    }

    /**
     * Upper regularized incomplete gamma function Q(a,x).
     */
    private function _regularized_gamma_q($a, $x) {
        if ($x < 0 || $a <= 0) return 1;
        if ($x == 0) return 1;

        // Series expansion for lower gamma, then Q = 1 - P
        if ($x < $a + 1) {
            $sum = 1 / $a;
            $term = 1 / $a;
            for ($i = 1; $i <= 200; $i++) {
                $term *= $x / ($a + $i);
                $sum += $term;
                if (abs($term) < abs($sum) * 1e-10) break;
            }
            $p = $sum * exp(-$x + $a * log($x) - $this->_log_gamma($a));
            return 1 - $p;
        }

        // Continued fraction for upper gamma
        $f = 1e-30;
        $c = 1e30;
        $d = 1 / ($x + 1 - $a);
        $h = $d;
        for ($i = 1; $i <= 200; $i++) {
            $an = -$i * ($i - $a);
            $bn = $x + 2 * $i + 1 - $a;
            $d = $an * $d + $bn;
            if (abs($d) < 1e-30) $d = 1e-30;
            $c = $bn + $an / $c;
            if (abs($c) < 1e-30) $c = 1e-30;
            $d = 1 / $d;
            $delta = $d * $c;
            $h *= $delta;
            if (abs($delta - 1) < 1e-10) break;
        }
        return $h * exp(-$x + $a * log($x) - $this->_log_gamma($a));
    }
}
