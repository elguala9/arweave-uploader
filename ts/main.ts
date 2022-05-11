
const fs = require('fs');
import { parse } from 'csv-parse';




export class ArweaveUtility{
    private static collection : string;
    private static hashes_content : string;
    
      
    public static readCSV(csv_file_path : string, dir_json : string, collection : string){
        this.collection = collection;    
        var hashes_file = fs.readFileSync("../hashes.json");
        this.hashes_content = JSON.parse(hashes_file);    
        
        //'File Id', 'File Name', 'Parent Folder ID', 'Data Transaction ID', 'Metadata Transaction ID', 'File Size', 'Date Created', 'Last Modified', 'Direct Download Link'
        
        const file_content = fs.readFileSync(csv_file_path, { encoding: 'utf-8' });
      
        parse(file_content, {}, (error, result: string[]) => {
          if (error) {
            console.error(error);
          }

          let csv_row : string[];
          let image : string;
          for(let i = 1; i < result.length; i++){
                csv_row  = new String(result[i]).split(',');
                image = csv_row[1];
                //console.log('Path image' +i +':' + path_image);
                if(this._checkJson(csv_row[1], dir_json)){
                    this._updateJson(this._jsonPath(image, dir_json), csv_row[8]);
                }
                else {
                    //console.log("KO"+this._jsonPath(path_image, dir_json));
                    this._writeLog('Json of ' +image + ' not found');
                }
          }
          //this.check(dir_image + result);
        });
    }

    public static dummyJson(dir_json : string){
        fs.readdirSync(dir_json).forEach((file : string) => {
            ArweaveUtility._updateJson(dir_json+file, 'dummy')
          });
    }

    public static checkDummyJson(dir_json : string){
        fs.readdirSync(dir_json).forEach((file : string) => {
            var file_content = fs.readFileSync(dir_json+file);
            var content = JSON.parse(file_content);
            if(content.image == 'dummy'){
                console.log(file + ' KO '+content.image);
                this._writeLog(dir_json+file + ' still has dummy');
            }
          });
    }

    private static _jsonPath(image : string, dir_json : string){
        var filename = image;
        filename = filename.replace('.png', '');
        filename = filename.replace('.jpg', '');
        return dir_json + filename;
    }

    private static _checkJson(image : string, dir_json : string){
        //console.log(path_json);
        return fs.existsSync(this._jsonPath(image, dir_json));
            
        
    }

    private static _updateJson(path_json : string, url : string){
        var file_content = fs.readFileSync(path_json);
        var content = JSON.parse(file_content);
        content.image = url;
        if(content.edition != null){
            content.id = content.edition;
            delete content.edition;
        }

        //Personalized code for Ocelot
        if(this.collection == "Ocelot"){
            content.collection = "Ocelot Society"
            if(content.id < 110)
                content.category = "Custom Rare - Tier 1";  
            else
                content.category = "Ultra Rare - Tier 2";
        }
        //----------------------------
        content.hash = this.hashes_content[content.id][content.id];
        
        fs.writeFileSync(path_json, JSON.stringify(content));
    }

    private static _writeLog(data : string){

        var stream = fs.createWriteStream("../log.txt", {flags:'a'});
        //console.log(new Date().toISOString());
        [...Array(1)].forEach( function () {
            stream.write(new Date().toISOString() + " " + data + "\n");
        });
        //console.log(new Date().toISOString());
        stream.end();   
    }
}
