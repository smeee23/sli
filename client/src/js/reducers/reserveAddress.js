const reserveAddressReducer = (state = null, action) => {
	switch (action.type) {
		case 'UPDATE_RESERVE_ADDRESS':
			return action.value
		default:
			return state
	}
}

export default reserveAddressReducer