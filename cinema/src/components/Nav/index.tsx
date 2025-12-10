import {Link} from 'react-router-dom';

export const Nav = () => {
	return (
		<>
			<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
				<div className="container">
					<Link to="/" className="navbar-brand">
						<i className="bi bi-film me-2"></i>
						CineWeb
					</Link>
					<button
						className="navbar-toggler"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarNav"
						aria-controls="navbarNav"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<span className="navbar-toggler-icon"></span>
					</button>
					<div className="collapse navbar-collapse" id="navbarNav">
						<ul className="navbar-nav ms-auto">
							<li className="nav-item">
								<Link to="/" className="nav-link">
									<i className="bi bi-house me-1"></i>
									Home
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/filmes" className="nav-link">
									<i className="bi bi-film me-1"></i>
									Filmes
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/salas" className="nav-link">
									<i className="bi bi-door-open me-1"></i>
									Salas
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/sessoes" className="nav-link">
									<i className="bi bi-calendar-event me-1"></i>
									Sessões
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/pedidos" className="nav-link">
									<i className="bi bi-cart me-1"></i>
									Pedidos
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		</>
	);
};
