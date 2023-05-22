const poolTrackerAddressReducer = (state = null, action) => {
	switch (action.type) {
		case 'UPDATE_POOL_TRACKER_ADDRESS':
			return action.value
		default:
			return state
	}
}

export default poolTrackerAddressReducer