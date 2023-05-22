const tokenMapReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_TOKEN_MAP':
			return action.value
		default:
			return state
	}
}

export default tokenMapReducer