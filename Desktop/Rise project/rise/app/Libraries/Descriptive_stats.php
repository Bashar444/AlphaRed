<?php

namespace App\Libraries;

/**
 * Descriptive statistics library — pure PHP.
 * Calculates: mean, median, mode, standard deviation, variance,
 * skewness, kurtosis, quartiles, IQR, frequency distribution.
 */
class Descriptive_stats {

    /**
     * Calculate the arithmetic mean.
     */
    function mean($data) {
        if (empty($data)) return 0;
        return array_sum($data) / count($data);
    }

    /**
     * Calculate the median.
     */
    function median($data) {
        if (empty($data)) return 0;
        sort($data);
        $n = count($data);
        $mid = intdiv($n, 2);
        if ($n % 2 === 0) {
            return ($data[$mid - 1] + $data[$mid]) / 2;
        }
        return $data[$mid];
    }

    /**
     * Calculate the mode(s).
     */
    function mode($data) {
        if (empty($data)) return array();
        $counts = array_count_values(array_map('strval', $data));
        $max_count = max($counts);
        if ($max_count === 1) return array(); // no mode
        $modes = array_keys(array_filter($counts, function ($c) use ($max_count) {
            return $c === $max_count;
        }));
        return $modes;
    }

    /**
     * Calculate population variance.
     */
    function variance($data, $sample = false) {
        $n = count($data);
        if ($n < 2) return 0;
        $mean = $this->mean($data);
        $sum_sq = 0;
        foreach ($data as $val) {
            $sum_sq += pow($val - $mean, 2);
        }
        return $sum_sq / ($sample ? ($n - 1) : $n);
    }

    /**
     * Calculate standard deviation.
     */
    function std_dev($data, $sample = false) {
        return sqrt($this->variance($data, $sample));
    }

    /**
     * Calculate skewness (Fisher's method).
     */
    function skewness($data) {
        $n = count($data);
        if ($n < 3) return 0;
        $mean = $this->mean($data);
        $sd = $this->std_dev($data, true);
        if ($sd == 0) return 0;
        $sum = 0;
        foreach ($data as $val) {
            $sum += pow(($val - $mean) / $sd, 3);
        }
        return ($n / (($n - 1) * ($n - 2))) * $sum;
    }

    /**
     * Calculate excess kurtosis.
     */
    function kurtosis($data) {
        $n = count($data);
        if ($n < 4) return 0;
        $mean = $this->mean($data);
        $sd = $this->std_dev($data, true);
        if ($sd == 0) return 0;
        $sum = 0;
        foreach ($data as $val) {
            $sum += pow(($val - $mean) / $sd, 4);
        }
        $k = ($n * ($n + 1)) / (($n - 1) * ($n - 2) * ($n - 3)) * $sum;
        $correction = (3 * pow($n - 1, 2)) / (($n - 2) * ($n - 3));
        return $k - $correction;
    }

    /**
     * Calculate percentile (linear interpolation).
     */
    function percentile($data, $p) {
        if (empty($data)) return 0;
        sort($data);
        $n = count($data);
        $rank = ($p / 100) * ($n - 1);
        $lower = intval(floor($rank));
        $upper = intval(ceil($rank));
        if ($lower === $upper) return $data[$lower];
        $frac = $rank - $lower;
        return $data[$lower] + $frac * ($data[$upper] - $data[$lower]);
    }

    /**
     * Calculate quartiles Q1, Q2 (median), Q3.
     */
    function quartiles($data) {
        return array(
            'q1' => $this->percentile($data, 25),
            'q2' => $this->percentile($data, 50),
            'q3' => $this->percentile($data, 75),
        );
    }

    /**
     * Calculate interquartile range.
     */
    function iqr($data) {
        $q = $this->quartiles($data);
        return $q['q3'] - $q['q1'];
    }

    /**
     * Generate frequency distribution for categorical data.
     */
    function frequency($data) {
        $counts = array_count_values(array_map('strval', $data));
        arsort($counts);
        $total = count($data);
        $result = array();
        foreach ($counts as $value => $count) {
            $result[] = array(
                'value' => $value,
                'count' => $count,
                'percent' => $total > 0 ? round(($count / $total) * 100, 2) : 0,
            );
        }
        return $result;
    }

    /**
     * Generate a full descriptive summary.
     */
    function summary($data) {
        $n = count($data);
        if ($n === 0) {
            return array('n' => 0);
        }
        $q = $this->quartiles($data);
        return array(
            'n' => $n,
            'mean' => round($this->mean($data), 4),
            'median' => round($this->median($data), 4),
            'mode' => $this->mode($data),
            'std_dev' => round($this->std_dev($data, true), 4),
            'variance' => round($this->variance($data, true), 4),
            'min' => min($data),
            'max' => max($data),
            'range' => max($data) - min($data),
            'q1' => round($q['q1'], 4),
            'q2' => round($q['q2'], 4),
            'q3' => round($q['q3'], 4),
            'iqr' => round($q['q3'] - $q['q1'], 4),
            'skewness' => round($this->skewness($data), 4),
            'kurtosis' => round($this->kurtosis($data), 4),
        );
    }
}
