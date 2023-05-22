const shareReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_SHARE':
			return action.value
		default:
			return state
	}
}

export default shareReducer