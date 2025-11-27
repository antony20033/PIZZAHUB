import React from "react";
import { Container, Row } from "reactstrap";
import PropTypes from "prop-types";


function Footer(props){
    return(
        <footer className={"footer" + (props.default ? "footer-default" : "")}>
            <Container fluid={props.fluid ? true : false}>
                <Row>
                    <nav className="footer-nav">
                        
                    </nav>
                </Row>
            </Container>





        </footer>
    )
};
export default Footer