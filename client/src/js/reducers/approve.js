const approveReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_APPROVE':
			return action.value
		default:
			return state
	}
}

export default  approveReducer