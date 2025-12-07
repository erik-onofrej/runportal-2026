import { ModelConfig } from '@/lib/admin/types';
import { MapPin } from 'lucide-react';

export const regionConfig: ModelConfig = {
  name: 'Region',
  namePlural: 'Regions',
  nameSingular: 'Region',
  icon: MapPin,
  description: 'Manage Slovak regions (kraje)',
  primaryField: 'name',
  group: 'Locations',

  defaultSort: { field: 'sortOrder', direction: 'asc' },
  searchFields: ['name', 'code'],
  perPage: 20,

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
      label: 'Region Name',
      required: true,
      placeholder: 'Bratislavský kraj',
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
      placeholder: 'BA',
      min: 2,
      max: 10,
      helpText: 'Short code for the region',
      showInList: true,
      sortable: true,
      searchable: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
      helpText: 'Display order',
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
    delete: false, // Don't allow deleting regions
  },
};
