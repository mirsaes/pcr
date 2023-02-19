import RemoveIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import IconButton from '@mui/material/IconButton';
import { HTMLAttributes } from 'react';

interface TagListProps 
{
    tags: string[];
    handleTagDelete: (tagToDelete: string) => void;
}

export default function TagList(props: TagListProps & HTMLAttributes<HTMLElement>)
{
    const tags = props?.tags;
    const onTagDelete = props?.handleTagDelete?props.handleTagDelete:
        function (clickedTagValue: string) {
            console.info(`clicked tag='${clickedTagValue}'`);
        };

    const onClickTagDelete = (e:any) => {
        const clickedTagValue = e.currentTarget.dataset.tag;
        onTagDelete(clickedTagValue);
    };

    return (
        <>
        {
            tags.length > 0?(
                tags?.map( (tag, index) => (
                    <div style={{display: "flex" , alignItems: "center"}} key={index}>
                    <div style={{flex:1,marginRight: '0.5em'}} >{tag}</div><IconButton onClick={onClickTagDelete} data-tag={tag}><RemoveIcon /></IconButton >
                    </div>
                  ))

            ):(
                <></>
            )
        }
        </>
    );
} 