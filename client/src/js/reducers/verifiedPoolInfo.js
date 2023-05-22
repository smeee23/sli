const verifiedPoolInfoReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_VERIFIED_POOL_INFO':
			return action.value
		default:
			return state
	}
}

export default verifiedPoolInfoReducer