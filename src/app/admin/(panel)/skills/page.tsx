'use client';

import CollectionEditor from '../../../../components/admin/CollectionEditor';

export default function SkillsPage() {
   return (
      <CollectionEditor
         endpoint="skills"
         title="Skills"
         description="Groups shown in the Skills section."
         blank={{ name: '', items: [], translations: {} }}
         summarize={(s) => ({ title: String(s.name), meta: (s.items as string[]).join(', ') })}
         fields={[
            { name: 'name', label: 'Group', type: 'text', required: true, translatable: true },
            { name: 'items', label: 'Items', type: 'tags', hint: 'Comma separated' },
         ]}
      />
   );
}
