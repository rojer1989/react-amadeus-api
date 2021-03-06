import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import CircularProgress from 'material-ui/CircularProgress';
import Hotel from '../../components/Hotel';
import './style.css';

class HotelsList extends Component {
	state = {
		pages: [],
		hotels: [],
		hotelsData: [],
		currentPage: 1,
		isEmptyData: null
	};

	paginationHandler = page => {
		this.setState((prevState, props) => {
			return {
				hotelsData: props.hotels.slice(
					prevState.hotels[page - 1].from,
					prevState.hotels[page - 1].to + 1
				),
				currentPage: page
			};
		});
	};

	componentWillReceiveProps(nextProps) {
		// pagination
		const currentHotels = (numberOfPages, data) => {
			const pagination = {
				pages: [],
				hotels: []
			};
			for (let index = 1; index <= numberOfPages; index++) {
				let from = (index - 1) * 10;
				let to = index * 10 - 1;
				pagination.pages.push(index);
				pagination.hotels.push({
					from,
					to
				});
			}
			this.setState((prevState, props) => {
				return {
					...pagination,
					hotelsData:
						data.hotels.length !== 0
							? data.hotels.slice(
									pagination.hotels[0].from,
									pagination.hotels[0].to + 1
							  )
							: [],
					currentPage: 1,
					isEmptyData: data.hotels.length === 0
				};
			});
		};

		if (
			nextProps.hotels !== null &&
			_.difference(nextProps.hotels, this.props.hotels).length > 0
		) {
			const totalPages = Math.ceil(nextProps.hotels.length / 10);
			currentHotels(totalPages, nextProps);
		} else if (nextProps.hotels !== null && nextProps.hotels.length === 0) {
			currentHotels(0, nextProps);
		}
	}

	render() {
		const printPagination = () => {
			return this.state.hotelsData !== null && this.state.pages.length > 1 ? (
				<div className="pagination-list">
					{this.state.pages.map(page => (
						<span
							onClick={() => this.paginationHandler(page)}
							className={
								page === this.state.currentPage ? 'pagination active' : 'pagination'
							}
							key={_.uniqueId()}
						>
							{page}
						</span>
					))}
				</div>
			) : null;
		};

		// SPINNER
		if (this.props.loading) {
			return <CircularProgress className="spinner" size={80} thickness={5} />;
		}

		// IF 404
		if (this.props.error) {
			return (
				<div>
					<h2 className="empty-request">Bad request :(</h2>
					<h3 style={{ textAlign: 'center' }}>Please check the form and try again</h3>
				</div>
			);
		}

		return (
			<div className="hotels-list">
				{printPagination()}

				{/* IF ALL OK */}
				{this.state.hotelsData !== null && this.props.error === false
					? this.state.hotelsData.map(hotel => (
							<Hotel key={hotel.property_code} {...hotel} />
					  ))
					: null}

				{/* IF EMPTY RESPONSE */}
				{this.state.isEmptyData === true ? (
					<h2 className="empty-request">There are no hotels for such request...</h2>
				) : null}

				{printPagination()}
			</div>
		);
	}
}

const mapStateToProps = state => state;

export default connect(mapStateToProps)(HotelsList);
