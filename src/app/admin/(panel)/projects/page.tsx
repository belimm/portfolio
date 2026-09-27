'use client';

import CollectionEditor from '../../../../components/admin/CollectionEditor';

export default function ProjectsPage() {
   return (
      <CollectionEditor
         endpoint="projects"
         title="Projects"
         description="Shown under Work, in this order."
         blank={{
            title: '',
            subtitle: '',
            description: '',
            year: '',
            image_url: '',
            link: '',
            tags: [],
            visible: true,
            translations: {},
         }}
         summarize={(p) => ({ title: String(p.title), meta: [p.subtitle, p.year].filter(Boolean).join(' · ') })}
         fields={[
            { name: 'title', label: 'Title', type: 'text', required: true },
            { name: 'subtitle', label: 'Subtitle', type: 'text', translatable: true },
            { name: 'year', label: 'Year', type: 'text', hint: 'e.g. 2024 or 2022–24' },
            { name: 'link', label: 'Link', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea', translatable: true },
            { name: 'image_url', label: 'Image', type: 'file', accept: 'image/*' },
            { name: 'tags', label: 'Tags', type: 'tags', hint: 'Comma separated' },
            { name: 'visible', label: 'Visible on the site', type: 'checkbox' },
         ]}
      />
   );
}
