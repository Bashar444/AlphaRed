<?php

namespace App\Controllers\Api;

/**
 * CMS Admin endpoints — menus, pages, sections, footer.
 * All require admin auth.
 */
class AdminCms extends Api_base
{
    private function _guard()
    {
        if (!$this->api_is_admin) {
            return $this->forbidden('Admin access required');
        }
        return null;
    }

    // ─── MENUS ──────────────────────────────────

    /**
     * GET /api/v1/admin/cms/menus
     */
    public function menus()
    {
        if ($err = $this->_guard()) return $err;

        $rows = $this->Primo_menus_model->get_details(['status' => 'active'])->getResult();
        $menus = array_map(fn($m) => [
            'id'       => (int) $m->id,
            'title'    => $m->title,
            'location' => $m->location,
            'items'    => json_decode($m->items, true) ?: [],
            'status'   => $m->status,
        ], $rows);

        return $this->ok($menus);
    }

    /**
     * POST /api/v1/admin/cms/menus
     * Body: { title?, location?, items: [...] }
     */
    public function save_menus()
    {
        if ($err = $this->_guard()) return $err;

        $location = $this->request->getJsonVar('location') ?? 'header';
        $title    = $this->request->getJsonVar('title') ?? 'Main Menu';
        $items    = $this->request->getJsonVar('items');

        if (!is_array($items)) {
            return $this->fail('items must be an array');
        }

        // Upsert: find existing menu for this location or create new
        $existing = $this->Primo_menus_model->get_details(['location' => $location])->getRow();

        $data = [
            'title'      => $title,
            'location'   => $location,
            'items'      => json_encode($items),
            'status'     => 'active',
            'created_by' => $this->api_user_id,
        ];

        if ($existing && $existing->id) {
            $this->Primo_menus_model->ci_save($data, $existing->id);
            return $this->ok(['id' => (int) $existing->id], 'Menu updated');
        } else {
            $id = $this->Primo_menus_model->ci_save($data);
            return $this->created(['id' => (int) $id], 'Menu created');
        }
    }

    // ─── PAGES ──────────────────────────────────

    /**
     * GET /api/v1/admin/cms/pages
     */
    public function pages()
    {
        if ($err = $this->_guard()) return $err;

        $table = $this->db->prefixTable('pages');
        $rows = $this->db->query(
            "SELECT id, title, slug, status, full_width, hide_topbar, created_at, updated_at
             FROM {$table}
             WHERE deleted = 0
             ORDER BY id DESC"
        )->getResultArray();

        return $this->ok($rows);
    }

    /**
     * POST /api/v1/admin/cms/pages
     * Body: { title, slug, meta_title?, meta_description?, status?, full_width?, hide_topbar? }
     */
    public function create_page()
    {
        if ($err = $this->_guard()) return $err;

        $title = trim($this->request->getJsonVar('title') ?? '');
        $slug  = trim($this->request->getJsonVar('slug') ?? '');

        if (!$title || !$slug) {
            return $this->fail('title and slug are required');
        }

        // Sanitize slug
        $slug = preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace(' ', '-', $slug)));

        // Check uniqueness
        $table = $this->db->prefixTable('pages');
        $dup = $this->db->query("SELECT id FROM {$table} WHERE slug = ? AND deleted = 0", [$slug])->getRow();
        if ($dup) {
            return $this->fail('Slug already exists');
        }

        $data = [
            'title'            => $title,
            'slug'             => $slug,
            'meta_title'       => $this->request->getJsonVar('meta_title') ?? '',
            'meta_description' => $this->request->getJsonVar('meta_description') ?? '',
            'status'           => $this->request->getJsonVar('status') ?? 'draft',
            'full_width'       => $this->request->getJsonVar('full_width') ? 1 : 0,
            'hide_topbar'      => $this->request->getJsonVar('hide_topbar') ? 1 : 0,
            'created_at'       => date('Y-m-d H:i:s'),
        ];

        $this->db->table($table)->insert($data);
        $id = $this->db->insertID();

        return $this->created(['id' => $id], 'Page created');
    }

    /**
     * GET /api/v1/admin/cms/pages/:id
     */
    public function get_page($id = 0)
    {
        if ($err = $this->_guard()) return $err;

        $table = $this->db->prefixTable('pages');
        $page = $this->db->query(
            "SELECT * FROM {$table} WHERE id = ? AND deleted = 0",
            [$id]
        )->getRowArray();

        if (!$page) return $this->notFound();

        return $this->ok($page);
    }

    /**
     * PUT /api/v1/admin/cms/pages/:id
     */
    public function update_page($id = 0)
    {
        if ($err = $this->_guard()) return $err;

        $table = $this->db->prefixTable('pages');
        $page = $this->db->query("SELECT id FROM {$table} WHERE id = ? AND deleted = 0", [$id])->getRow();
        if (!$page) return $this->notFound();

        $data = [];
        $fields = ['title', 'slug', 'meta_title', 'meta_description', 'status', 'full_width', 'hide_topbar'];
        foreach ($fields as $f) {
            $val = $this->request->getJsonVar($f);
            if ($val !== null) {
                if ($f === 'slug') {
                    $val = preg_replace('/[^a-z0-9\-]/', '', strtolower(str_replace(' ', '-', $val)));
                }
                if ($f === 'full_width' || $f === 'hide_topbar') {
                    $val = $val ? 1 : 0;
                }
                $data[$f] = $val;
            }
        }

        if (empty($data)) return $this->fail('No fields to update');

        $data['updated_at'] = date('Y-m-d H:i:s');
        $this->db->table($table)->where('id', $id)->update($data);

        return $this->ok(null, 'Page updated');
    }

    /**
     * DELETE /api/v1/admin/cms/pages/:id
     */
    public function delete_page($id = 0)
    {
        if ($err = $this->_guard()) return $err;

        $table = $this->db->prefixTable('pages');
        $page = $this->db->query("SELECT id FROM {$table} WHERE id = ? AND deleted = 0", [$id])->getRow();
        if (!$page) return $this->notFound();

        $this->db->table($table)->where('id', $id)->update(['deleted' => 1]);

        return $this->ok(null, 'Page deleted');
    }

    // ─── SECTIONS ───────────────────────────────

    /**
     * GET /api/v1/admin/cms/pages/:id/sections
     */
    public function get_sections($page_id = 0)
    {
        if ($err = $this->_guard()) return $err;

        $rows = $this->Primo_page_sections_model->get_details(['page_id' => $page_id])->getResult();
        $sections = array_map(fn($s) => [
            'id'         => (int) $s->id,
            'page_id'    => (int) $s->page_id,
            'type'       => $s->type,
            'title'      => $s->title,
            'content'    => json_decode($s->content, true) ?: [],
            'sort_order' => (int) $s->sort_order,
            'status'     => $s->status,
        ], $rows);

        return $this->ok($sections);
    }

    /**
     * POST /api/v1/admin/cms/pages/:id/sections
     * Body: { sections: [ { id?, type, title, content, sort_order, status } ] }
     * Replaces all sections for the page (full save).
     */
    public function save_sections($page_id = 0)
    {
        if ($err = $this->_guard()) return $err;

        $sections = $this->request->getJsonVar('sections');
        if (!is_array($sections)) {
            return $this->fail('sections must be an array');
        }

        // Soft-delete all existing sections for this page
        $table = $this->db->prefixTable('primo_page_sections');
        $this->db->query("UPDATE {$table} SET deleted = 1 WHERE page_id = ?", [$page_id]);

        // Insert/update each section
        $saved = [];
        foreach ($sections as $idx => $sec) {
            $data = [
                'page_id'    => $page_id,
                'type'       => $sec['type'] ?? 'text_block',
                'title'      => $sec['title'] ?? '',
                'content'    => json_encode($sec['content'] ?? []),
                'sort_order' => $sec['sort_order'] ?? $idx,
                'status'     => $sec['status'] ?? 'active',
            ];

            $existingId = isset($sec['id']) ? (int) $sec['id'] : 0;
            if ($existingId) {
                $data['deleted'] = 0;
                $this->Primo_page_sections_model->ci_save($data, $existingId);
                $saved[] = $existingId;
            } else {
                $id = $this->Primo_page_sections_model->ci_save($data);
                $saved[] = $id;
            }
        }

        return $this->ok(['section_ids' => $saved], 'Sections saved');
    }

    // ─── FOOTER ─────────────────────────────────

    /**
     * GET /api/v1/admin/cms/footer
     */
    public function get_footer()
    {
        if ($err = $this->_guard()) return $err;

        $json = $this->Primo_site_settings_model->get_setting('footer_config');
        $footer = $json ? json_decode($json, true) : [
            'columns'      => [],
            'copyright'    => '© 2026 PrimoData Analytics. All rights reserved.',
            'social_links' => [],
        ];

        return $this->ok($footer);
    }

    /**
     * POST /api/v1/admin/cms/footer
     * Body: { columns, copyright, social_links }
     */
    public function save_footer()
    {
        if ($err = $this->_guard()) return $err;

        $body = $this->request->getJSON(true) ?? [];
        $footer = [
            'columns'      => $body['columns'] ?? [],
            'copyright'    => $body['copyright'] ?? '',
            'social_links' => $body['social_links'] ?? [],
        ];

        $this->Primo_site_settings_model->set_setting('footer_config', json_encode($footer));

        return $this->ok(null, 'Footer saved');
    }
}
