import React, {forwardRef, useImperativeHandle, useState, useRef } from "react";

import Modal from '@mui/material/Modal';
import StarIcon from '@mui/icons-material/Star';
import IconButton from '@mui/material/IconButton';
import CSS from 'csstype';

const ratingPopupStyle: CSS.Properties = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	
	/*bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
	*/
	backgroundColor:"var(--color-bg)",
	bottom: 'auto'
  };


interface RatingPopupProps {
    item: any;
    onItemRated: (clickedRating: number|string) => void;
    isAutoCloseOnRate?: boolean;
}

function RatingPopup({ item, onItemRated, isAutoCloseOnRate }: RatingPopupProps, ref: any)
{
	const [ isRatingOpen, setIsRatingOpen] = React.useState(false);


    //setIsRatingOpen(open);
    const handleRateItemClicked = async function (e: any) {
		const clickedRating = e.currentTarget.dataset.rating;

        try {
    		onItemRated(clickedRating);
        } catch (ex) {
            console.log(ex);
        }
        
        if (isAutoCloseOnRate || typeof(isAutoCloseOnRate) == 'undefined')
        {
            setIsRatingOpen(false);
        }
    };

    useImperativeHandle(ref , () => ({
        show: () => setIsRatingOpen(true),
    }));


    return (
        <>
        <Modal open={isRatingOpen} onClose={()=> setIsRatingOpen(false)}>
            <div className="ratingPopup" id="ratingPopup" style={ratingPopupStyle}>
                <IconButton onClick={(e)=> handleRateItemClicked(e)} data-rating="1" className="rateItem"><StarIcon className={item.rating >=1?"active-rating":""}></StarIcon></IconButton>
                <IconButton onClick={(e)=> handleRateItemClicked(e)} data-rating="2" className="rateItem"><StarIcon className={item.rating >=2?"active-rating":""}></StarIcon></IconButton>
                <IconButton onClick={(e)=> handleRateItemClicked(e)} data-rating="3" className="rateItem"><StarIcon className={item.rating >=3?"active-rating":""}></StarIcon></IconButton>
                <IconButton onClick={(e)=> handleRateItemClicked(e)} data-rating="4" className="rateItem"><StarIcon className={item.rating >=4?"active-rating":""}></StarIcon></IconButton>
                <IconButton onClick={(e)=> handleRateItemClicked(e)} data-rating="5" className="rateItem"><StarIcon className={item.rating >=5?"active-rating":""}></StarIcon></IconButton>
                </div>
        </Modal>
        </>
    );
}
export default forwardRef(RatingPopup);