


export const url = {
    HOME: '/app',
    VIEWTEMPLATE: '/app/view/:project_name',
    VIEW: '/app/view/',
    PROJECTSTEMPLATE: '/app/projects/:project_name?',
    PROJECTS: '/app/projects/',
    UPLOADLAYERTEMPLATE: '/app/upload/:project_name',
    UPLOADLAYER: '/app/upload/',
    STYLETEMPLATE: '/app/style/:project_name/:style_name',
    STYLE: '/app/style/',
    MAPPINGTEMPLATE: '/app/mapping/:project_name',
    MAPPING: '/app/mapping/',
    EXPORTTEMPLATE: '/app/exports/:export_name',
    EXPORT: '/app/exports/',
};

export const apiurl = {
    LISTPROJECT: '/api/projects',
    ADDPROJECT: '/api/project',
    EXISTSPROJECT: '/api/project/exists',
    RENAMEPROJECT: '/api/project/rename',
    DELETEPROJECT: '/api/project',
    BUILDPROJECT: '/api/project/build',
    GETMETA: '/api/project/meta',
    
    LISTLAYER: '/api/layers',
    ADDLAYER: '/api/layer',
    RENAMELAYER: '/api/layer/rename',
    DELETELAYER: '/api/layer',
    ENABLELAYER: '/api/layer/enable',
    DISABLELAYER: '/api/layer/disable',
    MAPLAYERS: '/api/layer/map',
    
    LISTJOBS: '/api/jobs',
    LISTLOGS: '/api/logs',
    LOG: '/api/log',
    
    AUTHUSER: '/auth/user',
    TOKEN: '/auth/token',

    LISTSTYLES: '/api/styles',
    GETSTYLE: '/api/style',
    CREATESTYLE: '/api/style/create',
    UPDATESTYLE: '/api/style/update',
    DELETESTYLE: '/api/style',
    RENAMESTYLE: '/api/style/rename',
    APPLYSTYLE: '/api/style/apply',
    PARSESTYLE: '/api/style/parse',

    PROJECTDATA: '/api/data/',
    EXPORTDATA: '/api/exports/',

    LISTEXPORTS: '/api/exports',
    EXPORT: '/api/export/',
    EXPORTOBJ: '/api/export/obj',
    EXPORTLEGO: '/api/export/lego',
};
