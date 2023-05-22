const userDepositPoolAddrsReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_USER_DEPOSIT_POOL_ADDRS':
			return action.value
		default:
			return state
	}
}

export default userDepositPoolAddrsReducer