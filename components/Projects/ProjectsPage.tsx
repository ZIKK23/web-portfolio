import { projects } from "../../lib/projects";

export default function ProjectsPage() {
  return (
    <div>
      <header className="page-header">
        <div className="container">
          <h1>My Projects</h1>
          <p className="subtitle">Dabbling in anything and everything I find interesting. Explore my vision!</p>
        </div>
      </header>

      <main className="container">
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.title} className="project-card" data-cta="View Repo">
              {project.image && (
                <img className="project-card-bg" src={project.image} alt={project.title} />
              )}
              <div className="project-card-content">
                <h3 className="project-card-title">
                  <a
                    href={project.repoUrl}
                    className="project-card-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.title}
                  </a>
                </h3>
                <p className="project-card-desc">{project.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
