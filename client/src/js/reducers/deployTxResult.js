const deployTxResultReducer = (state = '', action) => {
	switch (action.type) {
		case 'DEPLOY_TX_RESULT':
			return action.value
		default:
			return state
	}
}

export default deployTxResultReducer