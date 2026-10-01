'use client';

import CollectionEditor from '../../../../components/admin/CollectionEditor';

export default function ExperiencePage() {
   return (
      <CollectionEditor
         endpoint="experience"
         title="Experience"
         description="Jobs and education. Education entries are listed under their own heading."
         blank={{
            kind: 'work',
            title: '',
            organization: '',
            location: '',
            start: '',
            end: '',
            summary: '',
            link: '',
            highlights: [],
            visible: true,
            translations: {},
         }}
         summarize={(e) => ({
            title: [e.title, e.organization].filter(Boolean).join(' at '),
            meta: `${e.kind === 'education' ? 'Education · ' : ''}${[e.start, e.end].filter(Boolean).join(' – ')}`,
         })}
         fields={[
            {
               name: 'kind',
               label: 'Type',
               type: 'select',
               options: [
                  { value: 'work', label: 'Work' },
                  { value: 'education', label: 'Education' },
               ],
            },
            { name: 'title', label: 'Role or degree', type: 'text', required: true, translatable: true },
            { name: 'organization', label: 'Company or school', type: 'text' },
            { name: 'link', label: 'Website', type: 'text', hint: 'https://… (makes the title a link)' },
            { name: 'location', label: 'Location', type: 'text', translatable: true },
            { name: 'start', label: 'Start', type: 'text', hint: 'e.g. Dec 2022', translatable: true },
            { name: 'end', label: 'End', type: 'text', hint: 'e.g. Present', translatable: true },
            { name: 'summary', label: 'Summary', type: 'textarea', translatable: true },
            { name: 'highlights', label: 'Highlights', type: 'lines', hint: 'One per line', translatable: true },
            { name: 'visible', label: 'Visible on the site', type: 'checkbox' },
         ]}
      />
   );
}
