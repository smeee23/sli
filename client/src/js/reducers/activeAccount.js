const activeAccountReducer = (state = 'Connect', action) => {
	switch (action.type) {
		case 'UPDATE_ACTIVE_ACCOUNT':
			return action.value
		default:
			return state
	}
}

export default activeAccountReducer