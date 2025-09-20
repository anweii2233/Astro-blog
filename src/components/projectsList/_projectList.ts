interface projectsType {
  projectName: string
  description: string
  repoLink: string
  previewLink: string
}

type Projects<T> = T[]

export const projects: Projects<projectsType> = [
  {
    projectName: 'Online chat platform',
    description: 'A chat software developed based on electron.',
    repoLink: 'https://github.com/Ekarmore/hug',
    previewLink: 'https://hug.ekar.site',
  },
  {
    projectName: 'Cloud disk tool',
    description: 'Cloud storage for C-end users.',
    repoLink: 'https://github.com/Ekarmore/Aggr',
    previewLink: 'https://aggr.ekar.site',
  },
  {
    projectName: 'Blockchain for traceability of agricultural products',
    description: 'Blockchain ensures the traceability chain.',
    repoLink: 'https://github.com/Ekarmore/ekar.site',
    previewLink: 'https://ekar.site',
  },
]
