const loadingReducer = (state = 'loading', action) => {
	switch (action.type) {
		case 'UPDATE_LOADING':
			return action.value
		default:
			return state
	}
}

export default loadingReducer