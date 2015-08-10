//////////////////
// Input
//////////////////
var inputFolder = Folder.selectDialog ("Specify input folder");
//var inputFolder = new Folder("l:\\tmp");

var outputFolder = Folder.selectDialog ("Specify output folder");
//var outputFolder = new Folder("l:\\output");

var prefixSizeStr = prompt('Specify photo prefix length. Example: if your original files look like IMG_328484_1.jpg, IMG_328484_2.jpg ... the prefix is IMG_328484 which is 10 characters. In this case you\'ll have to enter 10 below.', '', 'Photo prefix length');




//////////////////////
// Methods
//////////////////////
function group(prefixLength, files){
    var groups = {};
    for(var i = 0; i<files.length; i++){
        var file = files[i];
        var prefix = file.name.substr(0, prefixLength);
        if(!groups[prefix]){
            groups[prefix] = [];
        }
        groups[prefix].push(file);
    }
    return groups;
};

function processGroup(files, outFolder){
	var outputFileName = files[0].name;

	// Find resolution of first picture
	app.load(files[0]); //load it into documents
	backFile= app.activeDocument; //prepare your image layer as active document
	var width = backFile.width;
	var height = backFile.height;
	backFile.close(SaveOptions.DONOTSAVECHANGES); //close image without saving changes

	var doc = app.documents.add( width, height );

	for(var i =0; i<files.length; i=i+1){
	   app.load(files[i]); //load it into documents
	   backFile= app.activeDocument; //prepare your image layer as active document
	   backFile.selection.selectAll();
	   backFile.selection.copy(); //copy image into clipboard
	   backFile.close(SaveOptions.DONOTSAVECHANGES); //close image without saving changes
	   doc.paste(); //paste selection into your document
	   doc.layers[0].name = "BackgroundImage"; //set your layer's name
	}

	// Save document
	// Options for the soon to be Auto Saved PSD file
	var psd_Opt               = new PhotoshopSaveOptions();
	psd_Opt.layers            = true; // Preserve layers.
	psd_Opt.embedColorProfile = true; // Preserve color profile.
	psd_Opt.annotations       = true; // Preserve annonations.
	psd_Opt.alphaChannels     = true; // Preserve alpha channels.
	psd_Opt.spotColors        = true; // Preserve spot colors.

	// Save active document in the Auto Save folder
	doc.saveAs( new File(outFolder.fsName+'\\'+outputFileName), psd_Opt, true );
	doc.close(SaveOptions.DONOTSAVECHANGES);
}

// returns all files in specified folder
function getAllFiles(folder){
	var files = folder.getFiles();
	var res = [];
	for(var i=0; i<files.length; i++){
		var file = files[i];
		if(file instanceof File){
			res.push(file);
		}
	}
	return res;
}

//////////////////////
// Process files
//////////////////////
var ok = true;
var inputFiles;
if(!inputFolder || !inputFolder.exists){
	//alert(inputFolder?inputFolder.name: 'notok');
	alert("Input folder '"+(inputFolder?inputFolder.name:'')+"' does not exist!");
	ok = false;
} else{
	inputFiles = getAllFiles(inputFolder);
	if(inputFiles.length==0){
		alert("Input folder '"+inputFolder.name+"' is empty!");
		ok = false;
	}
}
if(!outputFolder || !outputFolder.exists){
	alert("Output folder '"+(outputFolder?outputFolder.name:'')+"' does not exist!");
	ok = false;
} else{
	var outFiles = getAllFiles(outputFolder);
	if(outFiles.length>0){
		alert("Warning: output folder '"+outputFolder.name+"' is not empty!");
	}
}

var prefixSize;
if(!prefixSizeStr){
	alert('Photo prefix length is not specified');
	ok = false;
} else{
	prefixSize = parseInt(prefixSizeStr);
	if(isNaN(prefixSize)){
		alert("Photo prefix length '"+prefixSizeStr+"' is not a number");
		ok = false;
	} else if(prefixSize<=0){
		alert("Photo prefix length must be greater than 0");
		ok = false;
	}
}

if(ok){
	if(inputFiles.length==0){
		alert("Folder "+inputFolder.name+" is empty!");
	} else{
		// Remember current unit settings and then set units to
		// the value expected by this script
		var originalUnit = preferences.rulerUnits
		preferences.rulerUnits = Units.PIXELS

		var groups = group(prefixSize, inputFiles);
		for(var groupKey in groups){
			var group = groups[groupKey];
			processGroup(group, outputFolder);
		}

		// Release references
		docRef = null;
		artLayerRef = null;
		textItemRef = null;
		// Restore original ruler unit setting
		app.preferences.rulerUnits = originalUnit;
	}
}
