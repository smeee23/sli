const ownerPoolInfoReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_OWNER_POOL_INFO':
			return action.value
		default:
			return state
	}
}

export default ownerPoolInfoReducer