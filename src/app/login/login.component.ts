import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {AlertService, AuthenticationService} from '../_services/index';

@Component({
  moduleId: module.id,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;  // 是否加载中的属性,同submitted
  returnUrl: string;
  validEmail = true;  // email格式检查
  usernameIsfocus = true;
  passwdIsfocus = false;
  loginformSubmitted = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) {
  }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // 邮箱格式校验
  email_format_authenticate(raw_email: string) {
    // this.usernameIsfocus = false;  // 光标移走后开验证
    // console.log('输入的邮箱是'+raw_email);
    const emailRegex = /^[A-Za-z0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,5}$/;
    if (emailRegex.test(raw_email)) {
      this.validEmail = true;
    } else {
      this.validEmail = false;
    }
    // console.log('当前状态validEmail'+this.validEmail);
  }

  // 光标聚焦到用户名输入框后关验证
  usernameFocus() {
    this.usernameIsfocus = true;
    this.passwdIsfocus = false;
    this.loginformSubmitted = false;
  }

  // 光标聚焦到用户名输入框后关验证
  passwdFocus() {
    this.passwdIsfocus = true;
    this.usernameIsfocus = false;
    this.loginformSubmitted = false;
  }

  changeloginformStatus() {
    this.loginformSubmitted = true;
    this.passwdIsfocus = false;
    this.usernameIsfocus = false;
  }

  login() {
    if (this.validEmail) {
      this.loading = true;
      this.authenticationService.login(this.model.username, this.model.password)
        .subscribe(
          data => {
            this.router.navigate([this.returnUrl]);
          },
          error => {
            this.alertService.error(error);
            this.loading = false;
          });
    }else {
      return false;
    }
  }

}


