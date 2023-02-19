import { PhotoTimeConnection } from "../api/PhototimeConnection";
import { NavItem } from "../AppLocation";
import { removeAllChildNodes, innerWidth, innerHeight } from "./DomUtils";


export type Size = 
{
	w: number;
	h: number;
};

type ConstrainedInfo =
{
	imageId: string;
	usew: number;
	useh: number;
}

export async function constrainImage(imgId: string, containerSize: Size): Promise<ConstrainedInfo>
{
    var img: any = document.querySelector("#"+imgId+" img") as HTMLImageElement;
	if (!img)
	{
		// punt, maybe navigated away
		return {imageId: imgId, useh: 600, usew: 400};
	}
	var containerIsPortrait = containerSize.h > containerSize.w;
	img.containerWidth=containerSize.w;
	img.containerHeight=containerSize.h;	
	img.origWidth = img.naturalWidth;
	img.origHeight = img.naturalHeight;
	var containerRatio = containerSize.w/containerSize.h;
	var imageRatio = img.width/img.height;
	if (!img.style) {
		img.style={};
	}

	// if ratio < 1 -> landscape
	// if ratio > 1 -> portrait

	var h1 = containerSize.h;
	var w1 = imageRatio*h1;

	var w2 = containerSize.w;
	var h2 = w2/imageRatio;

	var useh: number;
	var usew: number;
	if (w1 > containerSize.w) {
		useh = h2;
		usew = w2;
	} else if (h2 > containerSize.h) {
		useh = h1;
		usew = w1;
	} else {
		// both fit, pick closest
		var delta1 = containerSize.w - w1;
		var delta2 = containerSize.h - h2;

		if (delta1 > delta2) {
			useh = h2;
			//use2 = w2;
		} else {
			useh = h1;
			usew = w1;
		}
	}

	img.style.maxHeight=`${useh}px`;
	img.style.height=`${useh}px`;
	img.style.visibility='visible';
	//img.style.display = 'none';

	return new Promise((resolve) => {
		setTimeout(() => {
			/*
			img.style.display='none';
			var cnv = document.getElementById('detail-image-canvas');
			var ctx = cnv.getContext("2d");
			
			cnv.width = usew;
			cnv.height= useh;
	
			// destination x, destination y, destination width, destination height
			ctx.drawImage(img, 0, 0, usew, useh);
			cnv.style.display='block';
			panzoom(cnv);
			*/
			resolve({'imageId':imgId, usew:usew, useh:useh});
		});
	
	});


}

/*
expect sequence of elements below
<div className='detailImageContainer' id="detailImageContainer" >
	<div className="detailImageHolder">
		<img className="detailImage" alt="image detail" src="" />
		<canvas id="detail-image-canvas" sx={{display: "none"}}></canvas>
	</div>

<div id="imageEditContainer" class="fitImageContainer">
	<div id="imageEditHolder" class="fitImageHolder">
		<img id="imageEdit" class="fitImage"  src="" alt="the image to edit"/>
	</div>
</div>

*/
export type LoadedImageInfo =
{
	imageId: string;
	item: NavItem;
	containerSize: { w: number; h: number};
}

export async function loadImage(imageContainerDOMId: string, item: NavItem, photoTimeConnection: PhotoTimeConnection): Promise<LoadedImageInfo>
{
	// imageId for image container "image" in a img element
	// class for holding img element selector ".fitImage"
	//  

	var imageId = imageContainerDOMId;
	var gConx = photoTimeConnection;

	var thumbUrl = gConx.getThumbUrl(item.thumb)

	var imageContainer: any = document.getElementById(imageId );
	var imageElementSelector = "img.fitImage";

	var detailImageElement = imageContainer.querySelector(imageElementSelector) as HTMLImageElement;
    removeAllChildNodes(detailImageElement);
	detailImageElement.src="";


    // TODO: HUD
    //var detailImageLabelElement = imageContainer.querySelector(".detailImageLabel div");
    //removeAllChildNodes(detailImageLabelElement).textContent=item.label;

	//var img = $(`#${imageId} img`)[0];
    var img = imageContainer.querySelector("img");

	//var cnv = document.getElementById('detail-image-canvas');
	//cnv.style.display='none';

	delete img.style.display;
	img.style.visibility="hidden";
    // TODO Rating
	//$('.detailImageRating')[0].style.visibility='hidden';

	return new Promise((resolve) => {
		setTimeout(function() {
			var detailImageHolder=imageContainer.querySelector(".fitImageHolder");
	
			var containerSize=
			{
			  "w": innerWidth(detailImageHolder)
			, "h": innerHeight(detailImageHolder)
			};
			
			var imageElement = imageContainer.querySelector(imageElementSelector);
			removeAllChildNodes(imageElement);
			imageElement.src=thumbUrl;

			var myLoadFn = () => {
				var dd = imageContainer.querySelector(".detailImageHolder");
				resolve({'imageId':imageId, 'item':item, 'containerSize':containerSize});
			}
			var myImgElement = imageContainer.querySelector(imageElementSelector);
			myImgElement.removeEventListener("load", myLoadFn);
			myImgElement.addEventListener("load", myLoadFn);
		}, 10);
	
	});

}