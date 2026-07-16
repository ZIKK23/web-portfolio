export interface ProjectCardData {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
}

export const PROJECT_CARDS: ProjectCardData[] = [
  { id: 'card-1', title: 'Project 1', description: 'Short description of this project goes here.', repoUrl: '#' },
  { id: 'card-2', title: 'Project 2', description: 'Short description of this project goes here.', repoUrl: '#' },
  { id: 'card-3', title: 'Project 3', description: 'Short description of this project goes here.', repoUrl: '#' },
  { id: 'card-4', title: 'Project 4', description: 'Short description of this project goes here.', repoUrl: '#' },
];
