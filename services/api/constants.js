const api_url = function(){
    let api_url = ''
    if(process.env['APP_ENV'] == 'production'){
        api_url= 'http://3.16.51.45:8000/';
    }
    else{
        //api_url= 'https://kumarscable.herokuapp.com/';
        api_url= 'http://3.16.51.45:8000/';

    }
    return api_url
}

export const url = api_url()