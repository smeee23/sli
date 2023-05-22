const claimReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_CLAIM':
			return action.value
		default:
			return state
	}
}

export default  claimReducer