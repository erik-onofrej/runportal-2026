import { ModelConfig } from '@/lib/admin/types';
import { MapPin } from 'lucide-react';

export const districtConfig: ModelConfig = {
  name: 'District',
  namePlural: 'Districts',
  nameSingular: 'District',
  icon: MapPin,
  description: 'Manage Slovak districts (okresy)',
  primaryField: 'name',
  group: 'Locations',

  defaultSort: { field: 'sortOrder', direction: 'asc' },
  searchFields: ['name', 'code'],
  perPage: 50,

  fields: [
    {
      name: 'id',
      type: 'number',
      label: 'ID',
      readonly: true,
      hideInCreate: true,
      hideInEdit: true,
      showInList: true,
    },
    {
      name: 'name',
      type: 'string',
      label: 'District Name',
      required: true,
      placeholder: 'Bratislava I',
      min: 2,
      max: 100,
      showInList: true,
      sortable: true,
      searchable: true,
    },
    {
      name: 'code',
      type: 'string',
      label: 'Code',
      required: true,
      placeholder: 'BA1',
      min: 2,
      max: 10,
      helpText: 'Short code for the district',
      showInList: true,
      sortable: true,
      searchable: true,
    },
    {
      name: 'regionId',
      type: 'relation',
      label: 'Region',
      required: true,
      showInList: true,
      sortable: true,
      relation: {
        model: 'Region',
        displayField: 'name',
        foreignKey: 'regionId',
        idType: 'number',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
      helpText: 'Display order within region',
      showInList: true,
      sortable: true,
    },
    {
      name: 'createdAt',
      type: 'date',
      label: 'Created At',
      readonly: true,
      hideInCreate: true,
      hideInEdit: true,
      showInList: false,
    },
  ],

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: false, // Don't allow deleting districts
  },
};
