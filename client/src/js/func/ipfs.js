import fleek from '@fleekhq/fleek-storage-js';

export const upload = async(data) => {
    let result;
    try{
        const input = {
            apiKey:'lkQePP4w+6IIZtvblSDUKQ==',
            apiSecret: 'dTPa+IfQGbeR+D3+yv5XEw1jXHlbeT9XD5dl5RbSEXQ=',
            key: 'test2',
            data: data,
        }

        result = await fleek.upload(input);
    }
    catch (error) {
        console.error(error);
    }
    return result;
}

export const getAbout = async(key) => {
    let result;
    try{
        const input = {
            apiKey:'lkQePP4w+6IIZtvblSDUKQ==',
            apiSecret: 'dTPa+IfQGbeR+D3+yv5XEw1jXHlbeT9XD5dl5RbSEXQ=',
            key: key,
            getOptions: ['hash'],
        }
        result = await fleek.get(input);
    }
    catch (error) {
        console.error(error);
    }
    return result;
}

export const getIpfsData = async(hash) => {
    let result;
    try{
        result = await fleek.getFileFromHash({hash: hash});
    }
    catch (error) {
        console.error(error);
    }
    return result;
}

export const getIpfsDataBuffer = async(hash) => {
    let result;
    try{
        result = await fleek.getFileFromHash({hash: hash, getFileFromHashOptions: ['buffer']});
    }
    catch (error) {
        console.error(error);
    }
    return result;
}