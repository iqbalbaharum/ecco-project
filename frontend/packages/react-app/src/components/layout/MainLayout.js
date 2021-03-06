import React from "react";
import MainNavigationLayout from './MainNavigation'
import { Container } from '@material-ui/core'

function MainLayout (props) {
  return (
    <div>
      <MainNavigationLayout />
      <Container>
        <main>{props.children}</main>
      </Container>
    </div>
  )
}

export default MainLayout