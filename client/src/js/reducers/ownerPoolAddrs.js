const ownerPoolAddrsReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_OWNER_POOL_ADDRS':
			return action.value
		default:
			return state
	}
}

export default ownerPoolAddrsReducer