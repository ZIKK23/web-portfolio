import StickyCards from '../animations/3d-sticky-cards/StickyCards';

export default function ProjectsPage() {
  return (
    <div>
      <header className="page-header">
        <div className="container">
          <h1>My Projects</h1>
          <p className="subtitle">Dabbling in anything and everything I find interesting. Explore my vision!</p>
        </div>
      </header>

      <StickyCards />
    </div>
  );
}
