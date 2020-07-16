const api_url = function(){
    let api_url = ''
    if(process.env['APP_ENV'] == 'production'){
        api_url= 'http://localhost:8000/';
       
    }
    else{
        
        api_url= 'http://localhost:8000/';

    }
    return api_url
}

export const url = api_url()