import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { overlayConfigFactory } from "angular2-modal";
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';

import { GameService } from '../../services/game.service'
import { UserService } from '../../services/user.service'
import { ConstantService } from '../../services/constant.service';


import { User } from '../../classes/user';
import { Game } from '../../classes/game';

import { AccountDialogComponent } from '../../components-child/account-dialog/account-dialog.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private topics = ConstantService.TOPICS;
  private games: Game[];
  private user: User;

  constructor(private gameService: GameService, private userService: UserService, private route: ActivatedRoute, private modal: Modal) {
    // listening for registered user, if there is one, render to user
    userService.loggedUser$.subscribe(user => {this.renderUser(user, { from: "change" })});
  }

  ngOnInit() {
    // load games for menu
    this.gameService
      .getGames({ order: "random", paging: 5 })
      .subscribe((res: any) => this.renderGames(res['data']));

    let token;

    // get  token if there is one in url
    this.route.queryParams.subscribe(queryParam => {
      token = queryParam['token'];
      console.log("TOKEN " + token);
      // if there is one, take user in db and render to user
      if (token) {
        console.log("1234");
        localStorage.setItem("token", token);
        this.userService.getUser(token).subscribe((res: any) => this.renderUser(res.user, { from: "queryParam" }));
      }
    });

    // get token from localstorage if there is one
    token = localStorage.getItem("token");
    console.log("TOKEN HERE" + token);
    if (token && token != "undefined") {
      this.userService.getUser(token).subscribe((res: any) => this.renderUser(res.user, { from: "localStorage" }));
    }
  }
  renderGames(games) {
    this.games = games;
  }
  renderUser(user, obj) {
    if (obj.from == "queryParam" || obj.from == "localStorage") {
      this.user = new User();
      console.log("USER" + JSON.stringify(user));
      this.user._id = user._id;
      this.user.token = user.accessToken;
      this.user.displayName = user.displayName;
      this.user.avatar = user.avatar;
      // if (obj.from == "queryParam" || obj.from == "localStorage") {
        // this.userService.loggedUserSource.next(this.user);
      // }
       this.userService.loggedUserSource.next(this.user);
    }  else {
      this.user = user;
    }
  }
  openDialog() {
    this.modal
      .open(AccountDialogComponent, overlayConfigFactory({ num1: 2, num2: 3, isBlocking: false }, BSModalContext))
      .then(dialog => this.userService.setUserDialog(dialog));
    // .close(true)
  }
  logout() {
    // this.userService.logout(this.user.token).subscribe(() => {
    localStorage.removeItem("token");
    this.userService.loggedUserSource.next(null);
    this.user = null;
    // delete this.user;
    // location.reload();
    // });
  }
}
