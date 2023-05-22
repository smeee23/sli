const networkIdReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_NETWORK_ID':
			return action.value
		default:
			return state
	}
}

export default networkIdReducer