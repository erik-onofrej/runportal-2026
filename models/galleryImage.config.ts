import { ModelConfig } from '@/lib/admin/types'
import { Image } from 'lucide-react'

export const galleryImageConfig: ModelConfig = {
  name: 'GalleryImage',
  namePlural: 'Gallery Images',
  nameSingular: 'Gallery Image',
  icon: Image,
  description: 'Manage images within galleries',
  primaryField: 'title',

  defaultSort: { field: 'sortOrder', direction: 'asc' },
  searchFields: ['title', 'description'],
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
      name: 'gallery',
      type: 'relation',
      label: 'Gallery',
      required: true,
      showInList: true,
      relation: {
        model: 'Gallery',
        displayField: 'title',
        foreignKey: 'galleryId',
      },
    },
    {
      name: 'imageUrl',
      type: 'string',
      label: 'Image URL',
      required: true,
      placeholder: '/images/galleries/photo-1.jpg',
      showInList: true,
    },
    {
      name: 'title',
      type: 'string',
      label: 'Image Title',
      placeholder: 'Optional image title',
      max: 200,
      showInList: true,
      sortable: true,
      searchable: true,
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      placeholder: 'Optional description or caption',
      max: 500,
      showInList: false,
      searchable: true,
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
      helpText: 'Order within gallery',
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
      showInList: true,
      sortable: true,
    },
  ],

  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
}
