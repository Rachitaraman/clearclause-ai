import { contentSecurityPolicy } from 'helmet';

/**@type{import('tailwind').Config} */
export default{
    content:[
        "./routes/**/*.{js,jsx}",
        ".public/**/*.html"
    ],
    theme:{
        extent:{},
    },
    plugins:[],
}
