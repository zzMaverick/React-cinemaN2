import {Link} from 'react-router-dom';

export const Home = () => {
	return (
		<div className="container mt-5">
			<div className="row justify-content-center">
				<div className="col-md-8 text-center">
					<h1 className="display-4 mb-4">
						<i className="bi bi-film me-3"></i>
						CineWeb
					</h1>
					<p className="lead mb-5">
						Sistema de Gestão de Cinema
					</p>

					<div className="row g-4">
						<div className="col-md-3">
							<div className="card h-100">
								<div className="card-body">
									<i className="bi bi-film display-4 text-primary mb-3"></i>
									<h5 className="card-title">Filmes</h5>
									<p className="card-text">Gerencie o catálogo de filmes</p>
									<Link to="/filmes" className="btn btn-primary">
										Acessar
									</Link>
								</div>
							</div>
						</div>

						<div className="col-md-3">
							<div className="card h-100">
								<div className="card-body">
									<i className="bi bi-door-open display-4 text-success mb-3"></i>
									<h5 className="card-title">Salas</h5>
									<p className="card-text">Cadastre as salas do cinema</p>
									<Link to="/salas" className="btn btn-success">
										Acessar
									</Link>
								</div>
							</div>
						</div>

						<div className="col-md-3">
							<div className="card h-100">
								<div className="card-body">
									<i className="bi bi-calendar-event display-4 text-warning mb-3"></i>
									<h5 className="card-title">Sessões</h5>
									<p className="card-text">Agende sessões e venda ingressos</p>
									<Link to="/sessoes" className="btn btn-warning">
										Acessar
									</Link>
								</div>
							</div>
						</div>

						<div className="col-md-3">
							<div className="card h-100">
								<div className="card-body">
									<i className="bi bi-cart display-4 text-info mb-3"></i>
									<h5 className="card-title">Pedidos</h5>
									<p className="card-text">Gerencie pedidos de ingressos e lanches</p>
									<Link to="/pedidos" className="btn btn-info">
										Acessar
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
