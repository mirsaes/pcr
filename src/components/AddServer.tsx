import { Form } from 'react-router-dom';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { gServers as servers, serverInfo } from '../ServerDataSource';

/*
export async function action(e) {
    const formData = e.target;
    //const formData = await request.formData();
    console.log(formData);
    //e.preventDefault();
    
    var server = {
        host:e.target.elements.server.value
        , port:e.target.elements.port.value
    };
    console.log(server);

    await servers.add(server);
    console.log(servers);
}
*/

interface AddServerProps 
{
    onAdd?: () => void;
}

export default function AddServer(props: AddServerProps)
{
    const onAdd = props.onAdd;

    const  handleSubmit = async function(e: any) {
        const formData = e.target;
        //const formData = await request.formData();
        console.log(formData);
        //e.preventDefault();
        
        var server: serverInfo = {
            host:e.target.elements.server.value
            , port:e.target.elements.port.value
        };
        console.log(server);
    
        servers.add(server);
        console.log(servers);
        if (onAdd) {
            onAdd();
        }
    }
    
    
    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Container>
                    <TextField name="server" type="text" placeholder="server DNS or IP" label="server"></TextField>
                    <TextField name="port" type="text" placeholder="server port (e.g. 443)" label="port" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />
                </Container>
                <Container>
                    <Button type="submit"  variant="contained" >Add</Button>
                </Container>
            </Form>
        </>        
        );
}