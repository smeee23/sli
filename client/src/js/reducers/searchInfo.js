const searchInfoReducer = (state = '', action) => {
	switch (action.type) {
		case 'SEARCH_INFO':
			return action.value
		default:
			return state
	}
}

export default searchInfoReducer