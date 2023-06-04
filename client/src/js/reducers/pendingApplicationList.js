const pendingApplicationListReducer = (state = [], action) => {
	switch (action.type) {
		case 'PENDING_APPLICATION_LIST':
			return action.value
		default:
			return state
	}
}

export default pendingApplicationListReducer