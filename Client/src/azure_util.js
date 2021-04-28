import Cookie from 'universal-cookie';

// this function gets a security token from the Azure API and stores it in a cookie
// this server side function will use keys from Azure that must be securly stored
export async function getAzureTokenOrRefresh() {

    const cookie = new Cookie();
    const token = cookie.get('azure-token');

    if( token == undefined)
    {
        try{
            // get a token and store it in the cookie
                
        }
        catch(err)
        {

        }
    }
}