<?php

namespace App\Libraries;

/**
 * Regression library — Linear and Logistic regression.
 */
class Regression {

    /**
     * Simple linear regression: y = a + bx
     *
     * @param array $x Independent variable
     * @param array $y Dependent variable
     * @return array ['slope', 'intercept', 'r_squared', 'std_error', 'predictions']
     */
    function linear($x, $y) {
        $n = min(count($x), count($y));
        if ($n < 3) return array('slope' => 0, 'intercept' => 0, 'r_squared' => 0);

        $desc = new Descriptive_stats();
        $mean_x = $desc->mean(array_slice($x, 0, $n));
        $mean_y = $desc->mean(array_slice($y, 0, $n));

        $sum_xy = 0;
        $sum_xx = 0;
        $sum_yy = 0;
        for ($i = 0; $i < $n; $i++) {
            $dx = $x[$i] - $mean_x;
            $dy = $y[$i] - $mean_y;
            $sum_xy += $dx * $dy;
            $sum_xx += $dx * $dx;
            $sum_yy += $dy * $dy;
        }

        if ($sum_xx == 0) {
            return array('slope' => 0, 'intercept' => $mean_y, 'r_squared' => 0);
        }

        $slope = $sum_xy / $sum_xx;
        $intercept = $mean_y - $slope * $mean_x;

        // R-squared
        $ss_res = 0;
        $ss_tot = $sum_yy;
        $predictions = array();
        for ($i = 0; $i < $n; $i++) {
            $pred = $intercept + $slope * $x[$i];
            $predictions[] = round($pred, 4);
            $ss_res += pow($y[$i] - $pred, 2);
        }
        $r_squared = $ss_tot > 0 ? 1 - ($ss_res / $ss_tot) : 0;

        // Standard error of estimate
        $std_error = $n > 2 ? sqrt($ss_res / ($n - 2)) : 0;

        // Standard error of slope
        $se_slope = $sum_xx > 0 && $n > 2 ? $std_error / sqrt($sum_xx) : 0;

        // t-statistic for slope
        $t_slope = $se_slope > 0 ? $slope / $se_slope : 0;

        return array(
            'slope' => round($slope, 6),
            'intercept' => round($intercept, 6),
            'r_squared' => round($r_squared, 4),
            'std_error' => round($std_error, 4),
            'se_slope' => round($se_slope, 6),
            't_slope' => round($t_slope, 4),
            'n' => $n,
            'equation' => "y = " . round($intercept, 2) . " + " . round($slope, 2) . "x",
            'predictions' => $predictions,
        );
    }

    /**
     * Multiple linear regression: y = b0 + b1*x1 + b2*x2 + ...
     * Uses normal equations: B = (X'X)^(-1) X'Y
     *
     * @param array $X Array of arrays (each inner array is one predictor variable)
     * @param array $y Dependent variable
     * @return array
     */
    function linear_multiple($X, $y) {
        $n = count($y);
        $k = count($X);
        if ($n < $k + 2) return array('coefficients' => array(), 'r_squared' => 0);

        // Build design matrix with intercept column
        $design = array();
        for ($i = 0; $i < $n; $i++) {
            $row = array(1); // intercept
            for ($j = 0; $j < $k; $j++) {
                $row[] = isset($X[$j][$i]) ? $X[$j][$i] : 0;
            }
            $design[] = $row;
        }

        // X'X
        $p = $k + 1;
        $xtx = array_fill(0, $p, array_fill(0, $p, 0));
        $xty = array_fill(0, $p, 0);

        for ($i = 0; $i < $n; $i++) {
            for ($j = 0; $j < $p; $j++) {
                $xty[$j] += $design[$i][$j] * $y[$i];
                for ($l = 0; $l < $p; $l++) {
                    $xtx[$j][$l] += $design[$i][$j] * $design[$i][$l];
                }
            }
        }

        // Solve via Gaussian elimination
        $coefficients = $this->_solve_linear_system($xtx, $xty);
        if ($coefficients === null) {
            return array('coefficients' => array(), 'r_squared' => 0);
        }

        // R-squared
        $desc = new Descriptive_stats();
        $mean_y = $desc->mean($y);
        $ss_res = 0;
        $ss_tot = 0;
        for ($i = 0; $i < $n; $i++) {
            $pred = 0;
            for ($j = 0; $j < $p; $j++) {
                $pred += $coefficients[$j] * $design[$i][$j];
            }
            $ss_res += pow($y[$i] - $pred, 2);
            $ss_tot += pow($y[$i] - $mean_y, 2);
        }
        $r_squared = $ss_tot > 0 ? 1 - ($ss_res / $ss_tot) : 0;
        $adj_r_squared = $n > $p ? 1 - ((1 - $r_squared) * ($n - 1)) / ($n - $p) : $r_squared;

        return array(
            'intercept' => round($coefficients[0], 6),
            'coefficients' => array_map(function ($c) { return round($c, 6); }, array_slice($coefficients, 1)),
            'r_squared' => round($r_squared, 4),
            'adj_r_squared' => round($adj_r_squared, 4),
            'n' => $n,
            'predictors' => $k,
        );
    }

    /**
     * Simple logistic regression (binary outcome).
     * Uses iteratively reweighted least squares (IRLS).
     *
     * @param array $x Predictor values
     * @param array $y Binary outcome (0 or 1)
     * @param int $max_iter Maximum iterations
     * @return array ['b0', 'b1', 'odds_ratio', 'accuracy']
     */
    function logistic($x, $y, $max_iter = 100) {
        $n = min(count($x), count($y));
        if ($n < 5) return array('b0' => 0, 'b1' => 0, 'odds_ratio' => 1);

        // Initialize coefficients
        $b0 = 0;
        $b1 = 0;
        $learning_rate = 0.01;

        for ($iter = 0; $iter < $max_iter; $iter++) {
            $grad_b0 = 0;
            $grad_b1 = 0;

            for ($i = 0; $i < $n; $i++) {
                $z = $b0 + $b1 * $x[$i];
                $p = 1 / (1 + exp(-$z));
                $error = $y[$i] - $p;
                $grad_b0 += $error;
                $grad_b1 += $error * $x[$i];
            }

            $b0 += $learning_rate * $grad_b0 / $n;
            $b1 += $learning_rate * $grad_b1 / $n;

            // Check convergence
            if (abs($grad_b0 / $n) < 1e-8 && abs($grad_b1 / $n) < 1e-8) break;
        }

        // Calculate accuracy
        $correct = 0;
        for ($i = 0; $i < $n; $i++) {
            $p = 1 / (1 + exp(-($b0 + $b1 * $x[$i])));
            $predicted = $p >= 0.5 ? 1 : 0;
            if ($predicted == $y[$i]) $correct++;
        }

        return array(
            'b0' => round($b0, 6),
            'b1' => round($b1, 6),
            'odds_ratio' => round(exp($b1), 4),
            'accuracy' => round($correct / $n, 4),
            'n' => $n,
        );
    }

    /**
     * Solve a linear system Ax = b via Gaussian elimination with partial pivoting.
     */
    private function _solve_linear_system($A, $b) {
        $n = count($b);
        // Augmented matrix
        $M = array();
        for ($i = 0; $i < $n; $i++) {
            $M[$i] = array_merge($A[$i], array($b[$i]));
        }

        // Forward elimination
        for ($col = 0; $col < $n; $col++) {
            // Partial pivoting
            $max_val = abs($M[$col][$col]);
            $max_row = $col;
            for ($row = $col + 1; $row < $n; $row++) {
                if (abs($M[$row][$col]) > $max_val) {
                    $max_val = abs($M[$row][$col]);
                    $max_row = $row;
                }
            }
            if ($max_val < 1e-12) return null; // singular
            if ($max_row !== $col) {
                $temp = $M[$col];
                $M[$col] = $M[$max_row];
                $M[$max_row] = $temp;
            }

            for ($row = $col + 1; $row < $n; $row++) {
                $factor = $M[$row][$col] / $M[$col][$col];
                for ($j = $col; $j <= $n; $j++) {
                    $M[$row][$j] -= $factor * $M[$col][$j];
                }
            }
        }

        // Back substitution
        $x = array_fill(0, $n, 0);
        for ($i = $n - 1; $i >= 0; $i--) {
            $x[$i] = $M[$i][$n];
            for ($j = $i + 1; $j < $n; $j++) {
                $x[$i] -= $M[$i][$j] * $x[$j];
            }
            $x[$i] /= $M[$i][$i];
        }
        return $x;
    }
}
