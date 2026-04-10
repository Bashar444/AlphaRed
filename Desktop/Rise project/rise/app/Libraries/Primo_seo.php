<?php

namespace App\Libraries;

/**
 * SEO meta helper for PrimoData public pages.
 */
class Primo_seo {

    /**
     * Generate SEO meta tags for a public page.
     *
     * @param array $data ['title', 'description', 'url', 'image', 'type']
     * @return string HTML meta tags
     */
    function meta_tags($data = array()) {
        $title = isset($data['title']) ? esc($data['title']) : 'PrimoData Analytics';
        $description = isset($data['description']) ? esc($data['description']) : 'Hybrid Web Analytics SaaS — Survey Analytics, Public Statistics, AI-Powered Reports';
        $url = isset($data['url']) ? $data['url'] : base_url();
        $image = isset($data['image']) ? $data['image'] : base_url('assets/images/primodata-og.png');
        $type = isset($data['type']) ? $data['type'] : 'website';

        $html = '';
        $html .= '<meta name="description" content="' . $description . '">' . "\n";
        $html .= '<meta name="robots" content="index, follow">' . "\n";

        // Open Graph
        $html .= '<meta property="og:title" content="' . $title . '">' . "\n";
        $html .= '<meta property="og:description" content="' . $description . '">' . "\n";
        $html .= '<meta property="og:url" content="' . $url . '">' . "\n";
        $html .= '<meta property="og:image" content="' . $image . '">' . "\n";
        $html .= '<meta property="og:type" content="' . $type . '">' . "\n";
        $html .= '<meta property="og:site_name" content="PrimoData Analytics">' . "\n";

        // Twitter Card
        $html .= '<meta name="twitter:card" content="summary_large_image">' . "\n";
        $html .= '<meta name="twitter:title" content="' . $title . '">' . "\n";
        $html .= '<meta name="twitter:description" content="' . $description . '">' . "\n";
        $html .= '<meta name="twitter:image" content="' . $image . '">' . "\n";

        // Schema.org JSON-LD
        $schema = array(
            '@context' => 'https://schema.org',
            '@type' => 'WebApplication',
            'name' => 'PrimoData Analytics',
            'description' => $description,
            'url' => $url,
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Web',
            'offers' => array(
                '@type' => 'Offer',
                'price' => '499',
                'priceCurrency' => 'INR',
            ),
        );
        $html .= '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_SLASHES) . '</script>' . "\n";

        return $html;
    }

    /**
     * Generate sitemap XML entries for public pages.
     */
    function sitemap_entries() {
        $entries = array();

        // Static pages
        $entries[] = array('url' => base_url('public_stats'), 'priority' => '1.0', 'changefreq' => 'daily');
        $entries[] = array('url' => base_url('public_stats/search'), 'priority' => '0.8', 'changefreq' => 'weekly');

        // Published datasets
        $ci = &get_instance();
        $datasets = $ci->Primo_public_datasets_model->get_details(array("status" => "published"))->getResult();
        foreach ($datasets as $d) {
            $entries[] = array(
                'url' => base_url("public_stats/view/$d->id"),
                'priority' => '0.7',
                'changefreq' => 'monthly',
                'lastmod' => date('Y-m-d', strtotime($d->updated_at ?: $d->created_at)),
            );
        }

        return $entries;
    }
}
