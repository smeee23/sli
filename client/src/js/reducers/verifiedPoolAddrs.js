const verifiedPoolAddrsReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_VERIFIED_POOL_ADDRS':
			return action.value
		default:
			return state
	}
}

export default verifiedPoolAddrsReducer