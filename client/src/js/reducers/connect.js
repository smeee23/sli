const connectReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_CONNECT':
			return action.value
		default:
			return state
	}
}

export default  connectReducer