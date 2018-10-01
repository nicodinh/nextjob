/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
const grequest = require('graphql-request');

import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import Link from 'next/link';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';

import Chip from '@material-ui/core/Chip';
import DoneIcon from '@material-ui/icons/Face';
import Avatar from '@material-ui/core/Avatar';
import FaceIcon from '@material-ui/icons/Face';
import PlaceIcon from '@material-ui/icons/Place';
import PeopleIcon from '@material-ui/icons/People';
import EuroSymbolIcon from '@material-ui/icons/EuroSymbol';
import WorkIcon from '@material-ui/icons/Work';

import Input from '@material-ui/core/Input';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import DownshiftSelect from '../components/downshift';
import INDUSTRIES from '../data/industries';

import Cookies from 'js-cookie';

import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import ReactPlayer from 'react-player';
import ReactTimeout from 'react-timeout';
import MultipleDownshiftSelect from '../components/multipledownshift';
import SKILLS from '../data/skills';
import PERKS from '../data/perks';
import InputAdornment from '@material-ui/core/InputAdornment';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
  close: {
    padding: theme.spacing.unit / 2,
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  card: {
    width: '100%',
    marginTop: 10,
    marginRight: 10,
  },

  cardActionArea: {
    width: '100%',
  },
  media: {
    width: '100%',
    height: 400,
  },
});

// get language from query parameter or url path
const lang = 'fr';

class EditCompany extends React.Component {
  state = {
    open: false,
    industry: {},
    company: {
      yearFounded: 2006,
      url: '',
      name: '',
      employeeCount: 0,
      devCount: 0,
      id: 0,
      description: '',
      employee1: {name: '', title: '', bio: '', twitter: '', github: ''},
      employee2: {name: '', title: '', bio: '', twitter: '', github: ''},
      media1: {url: ''},
      media2: {url: ''},
      media3: {url: ''},
    },
  };
  handleBlurIndustry = (value, required) => {
    this.setState({
      industryvalid: value || !required ? true : false,
    });
  };

  constructor(props) {
    super(props);
    this.INDUSTRIES = INDUSTRIES.map(suggestion => ({
      value: suggestion.industry,
      label: props.i18n.t('industries:' + suggestion.industry),
    }));
    this.SKILLS = SKILLS.map(suggestion => ({
      value: suggestion.name,
      label: suggestion.name,
    }));
    this.PERKS = PERKS.map(suggestion => ({
      value: suggestion.title,
      label: suggestion.title,
    }));
  }

  componentDidMount(props) {
    console.log('company', this.props.companies, this.props.companyId);
    this.props.companies.map(company => {
      console.log(company, this.props.companyId);
      if (company.id === parseInt(this.props.companyId)) {
        /*alert(
          JSON.stringify({
            industry: {
              value: company.Industry,
              label: this.props.i18n.t('industries:' + company.Industry),
            },
          }),
        );*/
        if (!company.employee1) {
          company.employee1 = {
            name: '',
            title: '',
            bio: '',
            twitter: '',
            github: '',
          };
        }
        if (!company.employee2) {
          company.employee2 = {
            name: '',
            title: '',
            bio: '',
            twitter: '',
            github: '',
          };
        }
        if (!company.media1) {
          company.media1 = {url: ''};
        }
        if (!company.media2) {
          company.media2 = {url: ''};
        }
        if (!company.media3) {
          company.media3 = {url: ''};
        }
        console.log('got company', company);
        this.setState({
          skills: company.Skills.map(suggestion => ({
            value: suggestion.Skill,
            label: suggestion.Skill,
          })),
          perks: company.Perks.map(suggestion => ({
            value: suggestion.Perk,
            label: suggestion.Perk,
          })),

          company: company,
          industry: {
            value: company.Industry,
            label: this.props.i18n.t('industries:' + company.Industry),
          },
        });
        delete company['Skills'];
        delete company['Perks'];
      }
    });
  }

  handleBlur = (event, required) => {
    this.setState({
      [event.target.name + 'valid']:
        event.target.value || !required ? true : false,
    });
  };

  handleFocus = (event, required) => {
    this.setState({
      [event.target.name + 'valid']: true,
    });
  };

  handleUpdateCallback = () => {
    this.setState({openNotification: true});
  };

  handleChangeIndustry = value => {
    console.log(JSON.stringify(value));
    if (value) {
      this.setState({industry: value, industryvalid: true});
    } else {
      this.setState({industry: value, industryvalid: false});
    }
  };

  handleChange = event => {
    console.log(this.state);
    console.log(event.target.name, event.target.value, {
      ...this.state.company,
      ...{
        [event.target.name]: event.target.value,
      },
    });
    console.log('lolname', this.state.company.name);
    this.setState({
      company: {
        ...this.state.company,
        ...{
          [event.target.name]: event.target.value,
        },
      },
    });
  };

  handleChangeEmployee1 = event => {
    const employee1 = {
      employee1: {
        ...this.state.company.employee1,
        ...{
          [event.target.name]: event.target.value,
        },
      },
    };
    this.setState({
      company: {
        ...this.state.company,
        ...employee1,
      },
    });
  };

  handleChangeEmployee2 = event => {
    const employee2 = {
      employee2: {
        ...this.state.company.employee2,
        ...{
          [event.target.name]: event.target.value,
        },
      },
    };
    this.setState({
      company: {
        ...this.state.company,
        ...employee2,
      },
    });
  };
  upload = file => {
    console.log(file.target.files);
    const formData = new FormData();
    formData.append('file', file.target.files[0]);
    console.log(formData);
    fetch('/upload', {
      // Your POST endpoint
      method: 'POST',
      headers: {companyId: this.props.companyId},
      body: formData, // This is your file object
    })
      .then(
        response => response.json(), // if the response is a JSON object
      )
      .then(
        success => console.log(success), // Handle the success response object
      )
      .catch(
        error => console.log(error), // Handle the error response object
      );
  };

  uploadEmployee1Avatar = file => {
    console.log(file.target.files);
    const formData = new FormData();
    formData.append('file', file.target.files[0]);
    console.log(formData);
    fetch('/uploadEmployee1Avatar', {
      // Your POST endpoint
      method: 'POST',
      headers: {companyId: this.props.companyId},
      body: formData, // This is your file object
    })
      .then(
        response => response.json(), // if the response is a JSON object
        this.setState({employee1Uploaded: new Date()}),
      )
      .then(
        success => console.log(success), // Handle the success response object
      )
      .catch(
        error => console.log(error), // Handle the error response object
      );
  };

  uploadEmployee2Avatar = file => {
    console.log(file.target.files);
    const formData = new FormData();
    formData.append('file', file.target.files[0]);
    console.log(formData);
    fetch('/uploadEmployee2Avatar', {
      // Your POST endpoint
      method: 'POST',
      headers: {companyId: this.props.companyId},
      body: formData, // This is your file object
    })
      .then(
        response => response.json(), // if the response is a JSON object
        this.setState({employee2Uploaded: new Date()}),
      )
      .then(
        success => console.log(success), // Handle the success response object
      )
      .catch(
        error => console.log(error), // Handle the error response object
      );
  };

  uploadMedia1Image = file => {
    console.log(file.target.files);
    const formData = new FormData();
    formData.append('file', file.target.files[0]);
    console.log(formData);
    fetch('/uploadMedia1Image', {
      // Your POST endpoint
      method: 'POST',
      headers: {companyId: this.props.companyId},
      body: formData, // This is your file object
    })
      .then(response => {
        response.json(); // if the response is a JSON object
        const company = this.state.company;
        company.media1.hasVideo = false;
        this.setState({media1Uploaded: new Date(), company: company});
        setTimeout(() => this.setState({media1Uploaded: new Date()}), 1000);
      })
      .then(
        success => console.log(success), // Handle the success response object
      )
      .catch(
        error => console.log(error), // Handle the error response object
      );
  };

  uploadMedia2Image = file => {
    console.log(file.target.files);
    const formData = new FormData();
    formData.append('file', file.target.files[0]);
    console.log(formData);
    fetch('/uploadMedia2Image', {
      // Your POST endpoint
      method: 'POST',
      headers: {companyId: this.props.companyId},
      body: formData, // This is your file object
    })
      .then(response => {
        response.json(); // if the response is a JSON object
        const company = this.state.company;
        company.media2.hasVideo = false;
        this.setState({media2Uploaded: new Date(), company: company});
        setTimeout(() => this.setState({media2Uploaded: new Date()}), 1000);
      })
      .then(
        success => console.log(success), // Handle the success response object
      )
      .catch(
        error => console.log(error), // Handle the error response object
      );
  };

  uploadMedia3Image = file => {
    console.log(file.target.files);
    const formData = new FormData();
    formData.append('file', file.target.files[0]);
    console.log(formData);
    fetch('/uploadMedia3Image', {
      // Your POST endpoint
      method: 'POST',
      headers: {companyId: this.props.companyId},
      body: formData, // This is your file object
    })
      .then(response => {
        response.json(); // if the response is a JSON object
        const company = this.state.company;
        company.media3.hasVideo = false;
        this.setState({media3Uploaded: new Date(), company: company});
        setTimeout(() => this.setState({media3Uploaded: new Date()}), 1000);
      })
      .then(
        success => console.log(success), // Handle the success response object
      )
      .catch(
        error => console.log(error), // Handle the error response object
      );
  };

  handleChangeSkills = value => {
    console.log('value', value);
    if (value) {
      this.setState({skills: value, skillsvalid: true});
    } else {
      this.setState({
        skills: this.state.skills,
        skillsvalid: false,
      });
    }
  };

  handleChangePerks = value => {
    console.log('value', value);
    if (value) {
      this.setState({perks: value, perksvalid: true});
    } else {
      this.setState({
        perks: this.state.perks,
        perksvalid: false,
      });
    }
  };

  saveCompany = () => {
    const newCompany = {
      ...this.state.company,
      ...{Industry: this.state.industry.value},
    };
    const that = this;
    const createCompanyopts = {
      uri: 'http://localhost:8080/v1alpha1/graphql',
      json: true,
      query: `mutation update_Company($ownerId: Int!,
                $id: Int!,
    			$name: String!,
			    $url: String!,
			    $description: String!,
			    $yearFounded: Int!,
			    $employeeCount: Int,
			    $devCount: Int,
                $media1: json,
                $media2: json,
                $media3: json,
                $quote1: json,
                $quote2: json,
                $employee1: json,
                $employee2: json,
                $twitter: String,
				$Industry: String!,
               $skills: [SkillCompany_insert_input!]!,
               $perks: [PerkCompany_insert_input!]!
               ) {
				  update_Company(where: {id: {_eq: $id}},_set: {
					ownerId: $ownerId,
					name: $name,
                    twitter: $twitter,
					url: $url,
					description: $description,
					yearFounded: $yearFounded,
					Industry: $Industry,
                    employeeCount: $employeeCount,
			    devCount:$devCount,
                media1:$media1,
                media2:$media2,
                media3:$media3,
                quote1:$quote1,
                quote2:$quote2,
                employee1:$employee1,
                employee2:$employee2,
				}){
					returning{
					  id
					  name
			}
			}
  delete_SkillCompany(where: {CompanyId: {_eq: $id}}){
    affected_rows

}
		insert_SkillCompany(objects: $skills){
			    returning{Skill}

		}

  delete_PerkCompany(where: {CompanyId: {_eq: $id}}){
    affected_rows

}
		insert_PerkCompany(objects: $perks){
			    returning{Perk}

		}

			}
				`,
      headers: {
        'x-access-token': Cookies.get('token'),
      },
    };
    let skills = [];
    this.state.skills.map(skill => {
      console.log(skill);
      skills.push({
        Skill: skill.value.Skill || skill.value,
        CompanyId: this.state.company.id,
      });
    });
    newCompany.skills = skills;

    let perks = [];
    this.state.perks.map(perk => {
      console.log(perk);
      perks.push({
        Perk: perk.value.Perk || perk.value,
        CompanyId: this.state.company.id,
      });
    });
    newCompany.perks = perks;

    const client = new grequest.GraphQLClient(createCompanyopts.uri, {
      headers: createCompanyopts.headers,
    });

    console.log('newcompany', newCompany);
    client.request(createCompanyopts.query, newCompany).then(gdata => {
      this.handleUpdateCallback();
    });
  };

  render(props) {
    const {classes, job, i18n} = this.props;
    const {open} = this.state;
    const industries = this.INDUSTRIES;
    const skills = this.SKILLS;
    const perks = this.PERKS;
    return (
      <Grid container spacing={24} alignItems="center" justify="center">
        <Grid item xs={24} md={8}>
          <div style={{background: 'white'}}>
            <form>
              <FormControl
                className={classes.formControl}
                error={this.state.namevalid === false}>
                <InputLabel htmlFor="name-simple">{i18n.t('Name')}</InputLabel>
                <Input
                  id="name-simple"
                  name="name"
                  value={this.state.company.name}
                  onChange={this.handleChange}
                  onBlur={e => this.handleBlur(e, true)}
                  onFocus={e => this.handleFocus(e, true)}
                  required={true}
                />
                <FormHelperText
                  id={
                    this.state.namevalid !== false
                      ? 'name-helper-text'
                      : 'name-error-text'
                  }>
                  {this.state.namevalid !== false
                    ? i18n.t("Your company's name")
                    : i18n.t("Your company's name is required")}
                </FormHelperText>
              </FormControl>
              <FormControl
                className={classes.formControl}
                error={this.state.urlvalid === false}
                aria-describedby="url-text">
                <InputLabel htmlFor="url">{i18n.t('URL')}</InputLabel>
                <Input
                  id="url"
                  value={this.state.company.url}
                  name="url"
                  required={true}
                  type="url"
                  onBlur={e => this.handleBlur(e, true)}
                  onFocus={e => this.handleFocus(e, true)}
                  onChange={this.handleChange}
                />
                <FormHelperText
                  id={
                    this.state.urlvalid !== false
                      ? 'url-helper-text'
                      : 'url-error-text'
                  }>
                  {this.state.urlvalid !== false
                    ? i18n.t("Your company's website")
                    : i18n.t("Your company's website is required")}
                </FormHelperText>
              </FormControl>
              <FormControl
                className={classes.formControl}
                error={this.state.company.yearFoundedvalid === false}>
                <InputLabel htmlFor="yearFounded">
                  {i18n.t('Year founded')}
                </InputLabel>
                <Input
                  id="yearFounded"
                  name="yearFounded"
                  value={this.state.company.yearFounded}
                  onChange={this.handleChange}
                  required={true}
                  min={1900}
                  placeholder="2018"
                  onBlur={e => this.handleBlur(e, true)}
                  onFocus={e => this.handleFocus(e, true)}
                  type="number"
                />
                <FormHelperText
                  id={
                    this.state.yearFoundedvalid !== false
                      ? 'yearFounded-helper-text'
                      : 'yearFounded-error-text'
                  }>
                  {this.state.yearFoundedvalid !== false
                    ? i18n.t('The year your company was founded')
                    : i18n.t('The year your company was founded is required')}
                </FormHelperText>
              </FormControl>
              <FormControl
                className={classes.formControl}
                error={this.state.industryvalid === false}>
                <DownshiftSelect
                  i18n={i18n}
                  suggestions={industries}
                  defaultInputValue={this.state.industry}
                  label={this.state.industry.label || i18n.t('Industry')}
                  onBlur={e => this.handleBlur(e, true)}
                  onFocus={e => this.handleFocus(e, true)}
                  handleParentChange={this.handleChangeIndustry}
                  handleParentBlur={this.handleBlurIndustry}
                  name="industry"
                  id="jobIndustry"
                  required={true}
                />
                <FormHelperText
                  id={
                    this.state.industryvalid !== false
                      ? 'industry-helper-text'
                      : 'industry-error-text'
                  }>
                  {this.state.industryvalid !== false
                    ? i18n.t("Select your company's industry")
                    : i18n.t("Selecting your company's industry is required")}
                </FormHelperText>
              </FormControl>
              <FormControl
                className={classes.formControl}
                error={this.state.company.employeeCountvalid === false}>
                <InputLabel htmlFor="employeeCount">
                  {i18n.t('Employee count')}
                </InputLabel>
                <Input
                  id="employeeCount"
                  name="employeeCount"
                  value={this.state.company.employeeCount}
                  onChange={this.handleChange}
                  required={true}
                  min={0}
                  placeholder="1"
                  onBlur={e => this.handleBlur(e, true)}
                  onFocus={e => this.handleFocus(e, true)}
                  type="number"
                />
                <FormHelperText
                  id={
                    this.state.employeeCountvalid !== false
                      ? 'employeeCount-helper-text'
                      : 'employeeCount-error-text'
                  }>
                  {this.state.employeeCountvalid !== false
                    ? i18n.t('How many employees do you have')
                    : i18n.t('This field is required')}
                </FormHelperText>
              </FormControl>
              <FormControl
                className={classes.formControl}
                error={this.state.company.twittervalid === false}>
                <TextField
                  label="Twitter"
                  id="simple-start-adornment"
                  name="twitter"
                  value={this.state.company.twitter}
                  onChange={this.handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">@</InputAdornment>
                    ),
                  }}
                />
                <FormHelperText
                  id={
                    this.state.twittervalid !== false
                      ? 'twitter-helper-text'
                      : 'twitter-error-text'
                  }>
                  {i18n.t("Your company's twitter account")}
                </FormHelperText>
              </FormControl>
              <FormControl
                className={classes.formControl}
                error={this.state.company.devCountvalid === false}>
                <InputLabel htmlFor="devCount">
                  {i18n.t('Employee count')}
                </InputLabel>
                <Input
                  id="devCount"
                  name="devCount"
                  value={this.state.company.devCount}
                  onChange={this.handleChange}
                  required={true}
                  min={0}
                  placeholder="1"
                  onBlur={e => this.handleBlur(e, true)}
                  onFocus={e => this.handleFocus(e, true)}
                  type="number"
                />
                <FormHelperText
                  id={
                    this.state.devCountvalid !== false
                      ? 'devCount-helper-text'
                      : 'devCount-error-text'
                  }>
                  {this.state.devCountvalid !== false
                    ? i18n.t('How many developpers do you have')
                    : i18n.t('This field is required')}
                </FormHelperText>
              </FormControl>
              <FormControl
                className={classes.formControl}
                error={this.state.namevalid === false}>
                <InputLabel htmlFor="name-simple">{i18n.t('Logo')}</InputLabel>
                <Input
                  id="logo-simple"
                  onChange={this.upload}
                  name="file"
                  type="file"
                />
                <FormHelperText
                  id={
                    this.state.namevalid !== false
                      ? 'name-helper-text'
                      : 'name-error-text'
                  }>
                  {this.state.namevalid !== false
                    ? i18n.t("Your company's logo")
                    : i18n.t("Your company's logo is required")}
                </FormHelperText>
              </FormControl>
              <FormControl
                fullWidth={true}
                className={classes.formControl}
                error={this.state.company.descriptionvalid === false}>
                <InputLabel htmlFor="name-simple">
                  {i18n.t('Description')}
                </InputLabel>
                <Input
                  id="description"
                  value={this.state.company.description}
                  onChange={this.handleChange}
                  name="description"
                  required={true}
                  multiline={true}
                  onBlur={e => this.handleBlur(e, true)}
                  onFocus={e => this.handleFocus(e, true)}
                  rows={5}
                  fullWidth={true}
                />

                <FormHelperText
                  id={
                    this.state.descriptionvalid !== false
                      ? 'description-helper-text'
                      : 'description-error-text'
                  }>
                  {this.state.descriptionvalid !== false
                    ? i18n.t(
                        'Write a description about what your company is about',
                      )
                    : i18n.t(
                        'Writing a description about what your company is about is required',
                      )}
                </FormHelperText>
              </FormControl>
              {this.state.company.name ? (
                <>
                  <FormControl fullWidth={true} className={classes.formControl}>
                    <MultipleDownshiftSelect
                      i18n={i18n}
                      suggestions={skills}
                      selectedItems={this.state.skills}
                      label={i18n.t(
                        'List the techs being used at your company',
                      )}
                      placeholder={i18n.t(
                        'newjob:Select multiple skills (up to 25)',
                      )}
                      handleParentChange={this.handleChangeSkills}
                      name="skills"
                      id="skills"
                      maxSelection={25}
                      required={true}
                    />
                    <FormHelperText>
                      {i18n.t('newjob:Select skills required for the job')}
                    </FormHelperText>
                  </FormControl>

                  <FormControl fullWidth={true} className={classes.formControl}>
                    <MultipleDownshiftSelect
                      i18n={i18n}
                      suggestions={perks}
                      selectedItems={this.state.perks}
                      label={i18n.t(
                        'List the techs being used at your company',
                      )}
                      placeholder={i18n.t('newjob:Select multiple perks')}
                      handleParentChange={this.handleChangePerks}
                      name="perks"
                      id="perks"
                      maxSelection={25}
                      required={true}
                    />
                    <FormHelperText>
                      {i18n.t('newjob:Select perks required for the job')}
                    </FormHelperText>
                  </FormControl>
                </>
              ) : null}
              {this.state.company.employee1 ? (
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary">
                      {i18n.t('Featured employee #1')}
                    </Typography>
                    <Typography component="h2">
                      {i18n.t(
                        'Add details about an employee you think could encourage people to work at your company',
                      )}
                    </Typography>
                    <Avatar
                      src={
                        '/' +
                        this.state.company.id +
                        '-' +
                        this.state.company.ownerId +
                        '-' +
                        'employee1.png?u=' +
                        this.state.employee1Uploaded
                      }
                      className={classes.avatar}
                      onClick={() => this.fileInput.click()}
                    />

                    <input
                      style={{display: 'none'}}
                      ref={fileInput => (this.fileInput = fileInput)}
                      type="file"
                      onChange={this.uploadEmployee1Avatar}
                    />
                    <FormControl
                      className={classes.formControl}
                      error={this.state.namevalid === false}>
                      <InputLabel htmlFor="name-simple">
                        {i18n.t("Employee's Name")}
                      </InputLabel>
                      <Input
                        id="name-simple"
                        name="name"
                        value={this.state.company.employee1.name}
                        onChange={this.handleChangeEmployee1}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        required={true}
                      />
                      <FormHelperText
                        id={
                          this.state.namevalid !== false
                            ? 'name-helper-text'
                            : 'name-error-text'
                        }>
                        {this.state.namevalid !== false
                          ? i18n.t("Your employee's name")
                          : i18n.t("Your employee's name is required")}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      error={this.state.namevalid === false}>
                      <InputLabel htmlFor="title-simple">
                        {i18n.t("Employee's title")}
                      </InputLabel>
                      <Input
                        id="title-simple"
                        name="title"
                        value={this.state.company.employee1.title}
                        onChange={this.handleChangeEmployee1}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        required={true}
                      />
                      <FormHelperText
                        id={
                          this.state.titlevalid !== false
                            ? 'name-helper-text'
                            : 'name-error-text'
                        }>
                        {i18n.t("Your employee's title")}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      error={this.state.namevalid === false}>
                      <InputLabel htmlFor="name-simple">
                        {i18n.t("Employee's Twitter")}
                      </InputLabel>
                      <Input
                        id="twitter-simple"
                        name="twitter"
                        value={this.state.company.employee1.twitter}
                        onChange={this.handleChangeEmployee1}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        required={true}
                      />
                      <FormHelperText
                        id={
                          this.state.twittervalid !== false
                            ? 'name-helper-text'
                            : 'name-error-text'
                        }>
                        {i18n.t("Your employee's twitter")}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      error={this.state.namevalid === false}>
                      <InputLabel htmlFor="name-simple">
                        {i18n.t("Employee's Github")}
                      </InputLabel>
                      <Input
                        id="github-simple"
                        name="github"
                        value={this.state.company.employee1.github}
                        onChange={this.handleChangeEmployee1}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        required={true}
                      />
                      <FormHelperText
                        id={
                          this.state.githubvalid !== false
                            ? 'name-helper-text'
                            : 'name-error-text'
                        }>
                        {i18n.t("Your employee's github")}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      fullWidth={true}
                      className={classes.formControl}
                      error={this.state.company.biovalid === false}>
                      <InputLabel htmlFor="bio-simple">
                        {i18n.t('Bio')}
                      </InputLabel>
                      <Input
                        id="bio"
                        value={this.state.company.employee1.bio}
                        onChange={this.handleChangeEmployee1}
                        name="bio"
                        required={true}
                        multiline={true}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        rows={5}
                        fullWidth={true}
                      />

                      <FormHelperText
                        id={
                          this.state.biovalid !== false
                            ? 'bio-helper-text'
                            : 'bio-error-text'
                        }>
                        {this.state.biovalid !== false
                          ? i18n.t(
                              'Write a bio about your employee and what they do',
                            )
                          : i18n.t('A bio is required')}
                      </FormHelperText>
                    </FormControl>
                  </CardContent>
                </Card>
              ) : null}
              {this.state.company.employee2 ? (
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary">
                      {i18n.t('Featured employee #2')}
                    </Typography>
                    <Typography component="h2">
                      {i18n.t(
                        'Add details about an employee you think could encourage people to work at your company',
                      )}
                    </Typography>
                    <Avatar
                      src={
                        '/' +
                        this.state.company.id +
                        '-' +
                        this.state.company.ownerId +
                        '-' +
                        'employee2.png?u=' +
                        this.state.employee2Uploaded
                      }
                      className={classes.avatar}
                      onClick={() => this.fileInput2.click()}
                    />
                    <input
                      style={{display: 'none'}}
                      ref={fileInput2 => (this.fileInput2 = fileInput2)}
                      type="file"
                      onChange={this.uploadEmployee2Avatar}
                    />
                    <FormControl
                      className={classes.formControl}
                      error={this.state.namevalid === false}>
                      <InputLabel htmlFor="name-simple">
                        {i18n.t("Employee's Name")}
                      </InputLabel>
                      <Input
                        id="name-simple"
                        name="name"
                        value={this.state.company.employee2.name}
                        onChange={this.handleChangeEmployee2}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        required={true}
                      />
                      <FormHelperText
                        id={
                          this.state.namevalid !== false
                            ? 'name-helper-text'
                            : 'name-error-text'
                        }>
                        {this.state.namevalid !== false
                          ? i18n.t("Your employee's name")
                          : i18n.t("Your employee's name is required")}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      error={this.state.namevalid === false}>
                      <InputLabel htmlFor="title-simple">
                        {i18n.t("Employee's title")}
                      </InputLabel>
                      <Input
                        id="title-simple"
                        name="title"
                        value={this.state.company.employee2.title}
                        onChange={this.handleChangeEmployee2}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        required={true}
                      />
                      <FormHelperText
                        id={
                          this.state.titlevalid !== false
                            ? 'name-helper-text'
                            : 'name-error-text'
                        }>
                        {i18n.t("Your employee's title")}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      error={this.state.namevalid === false}>
                      <InputLabel htmlFor="name-simple">
                        {i18n.t("Employee's Twitter")}
                      </InputLabel>
                      <Input
                        id="twitter-simple"
                        name="twitter"
                        value={this.state.company.employee2.twitter}
                        onChange={this.handleChangeEmployee2}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        required={true}
                      />
                      <FormHelperText
                        id={
                          this.state.twittervalid !== false
                            ? 'name-helper-text'
                            : 'name-error-text'
                        }>
                        {i18n.t("Your employee's twitter")}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      className={classes.formControl}
                      error={this.state.namevalid === false}>
                      <InputLabel htmlFor="name-simple">
                        {i18n.t("Employee's Github")}
                      </InputLabel>
                      <Input
                        id="github-simple"
                        name="github"
                        value={this.state.company.employee2.github}
                        onChange={this.handleChangeEmployee2}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        required={true}
                      />
                      <FormHelperText
                        id={
                          this.state.githubvalid !== false
                            ? 'name-helper-text'
                            : 'name-error-text'
                        }>
                        {i18n.t("Your employee's github")}
                      </FormHelperText>
                    </FormControl>
                    <FormControl
                      fullWidth={true}
                      className={classes.formControl}
                      error={this.state.company.biovalid === false}>
                      <InputLabel htmlFor="bio-simple">
                        {i18n.t('Bio')}
                      </InputLabel>
                      <Input
                        id="bio"
                        value={this.state.company.employee2.bio}
                        onChange={this.handleChangeEmployee2}
                        name="bio"
                        required={true}
                        multiline={true}
                        onBlur={e => this.handleBlur(e, true)}
                        onFocus={e => this.handleFocus(e, true)}
                        rows={5}
                        fullWidth={true}
                      />

                      <FormHelperText
                        id={
                          this.state.biovalid !== false
                            ? 'bio-helper-text'
                            : 'bio-error-text'
                        }>
                        {this.state.biovalid !== false
                          ? i18n.t(
                              'Write a bio about your employee and what they do',
                            )
                          : i18n.t('A bio is required')}
                      </FormHelperText>
                    </FormControl>
                  </CardContent>
                </Card>
              ) : null}
              <Card className={classes.card}>
                <CardActionArea className={classes.cardActionArea}>
                  {this.state.company.media1.hasVideo ? (
                    <ReactPlayer url={this.state.company.media1.url} />
                  ) : (
                    <CardMedia
                      className={classes.media}
                      image={
                        '/' +
                        this.state.company.id +
                        '-' +
                        this.state.company.ownerId +
                        '-' +
                        'media1.png?u=' +
                        this.state.media1Uploaded
                      }
                      title="Contemplative Reptile"
                      onClick={() => this.media1FileInput.click()}
                    />
                  )}
                </CardActionArea>
                <CardActions>
                  <input
                    style={{display: 'none'}}
                    ref={media1FileInput =>
                      (this.media1FileInput = media1FileInput)
                    }
                    type="file"
                    onChange={this.uploadMedia1Image}
                  />
                  <TextField
                    id="standard-bare"
                    value={this.state.company.media1.url}
                    placeholder={i18n.t('Paste your video URL here')}
                    margin="normal"
                    onChange={e => {
                      const company = this.state.company;
                      company.media1.url = e.target.value;
                      this.setState({company: company});
                    }}
                  />
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      if (this.state.company.media1.url) {
                        const company = this.state.company;
                        company.media1.hasVideo = true;
                        this.setState({company: company});
                      }
                    }}>
                    {i18n.t('add video')}
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => this.media1FileInput.click()}>
                    {i18n.t('add image instead')}
                  </Button>
                </CardActions>
              </Card>

              <Card className={classes.card}>
                <CardActionArea className={classes.cardActionArea}>
                  {this.state.company.media2.hasVideo ? (
                    <ReactPlayer url={this.state.company.media2.url} />
                  ) : (
                    <CardMedia
                      className={classes.media}
                      image={
                        '/' +
                        this.state.company.id +
                        '-' +
                        this.state.company.ownerId +
                        '-' +
                        'media2.png?u=' +
                        this.state.media2Uploaded
                      }
                      title="Contemplative Reptile"
                      onClick={() => this.media2FileInput.click()}
                    />
                  )}
                </CardActionArea>
                <CardActions>
                  <input
                    style={{display: 'none'}}
                    ref={media2FileInput =>
                      (this.media2FileInput = media2FileInput)
                    }
                    type="file"
                    onChange={this.uploadMedia2Image}
                  />
                  <TextField
                    id="standard-bare"
                    value={this.state.company.media2.url}
                    placeholder={i18n.t('Paste your video URL here')}
                    margin="normal"
                    onChange={e => {
                      const company = this.state.company;
                      company.media2.url = e.target.value;
                      this.setState({company: company});
                    }}
                  />
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      if (this.state.company.media2.url) {
                        const company = this.state.company;
                        company.media2.hasVideo = true;
                        this.setState({company: company});
                      }
                    }}>
                    {i18n.t('add video')}
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => this.media2FileInput.click()}>
                    {i18n.t('add image instead')}
                  </Button>
                </CardActions>
              </Card>

              <Card className={classes.card}>
                <CardActionArea className={classes.cardActionArea}>
                  {this.state.company.media3.hasVideo ? (
                    <ReactPlayer url={this.state.company.media3.url} />
                  ) : (
                    <CardMedia
                      className={classes.media}
                      image={
                        '/' +
                        this.state.company.id +
                        '-' +
                        this.state.company.ownerId +
                        '-' +
                        'media3.png?u=' +
                        this.state.media3Uploaded
                      }
                      title="Contemplative Reptile"
                      onClick={() => this.media3FileInput.click()}
                    />
                  )}
                </CardActionArea>
                <CardActions>
                  <input
                    style={{display: 'none'}}
                    ref={media3FileInput =>
                      (this.media3FileInput = media3FileInput)
                    }
                    type="file"
                    onChange={this.uploadMedia3Image}
                  />
                  <TextField
                    id="standard-bare"
                    value={this.state.company.media3.url}
                    placeholder={i18n.t('Paste your video URL here')}
                    margin="normal"
                    onChange={e => {
                      const company = this.state.company;
                      company.media3.url = e.target.value;
                      this.setState({company: company});
                    }}
                  />
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      if (this.state.company.media3.url) {
                        const company = this.state.company;
                        company.media3.hasVideo = true;
                        this.setState({company: company});
                      }
                    }}>
                    {i18n.t('add video')}
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => this.media3FileInput.click()}>
                    {i18n.t('add image instead')}
                  </Button>
                </CardActions>
              </Card>
              <Button
                variant="contained"
                color="primary"
                onClick={this.saveCompany}
                className={classes.button}>
                {i18n.t('Save')}
              </Button>
            </form>
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              open={this.state.openNotification}
              autoHideDuration={6000}
              onClose={() => {
                this.setState({openNotification: false});
              }}
              ContentProps={{
                'aria-describedby': 'message-id',
              }}
              message={
                <span id="message-id">
                  {this.props.i18n.t('Company updated')}
                </span>
              }
              action={[
                /*  TODO implement undo save company
                <Button
                  key="undo"
                  color="secondary"
                  size="small"
                  onClick={() => {
                    this.setState({openNotification: false});
                  }}>
                  UNDO
                </Button>,*/
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  className={styles.close}
                  onClick={() => {
                    this.setState({openNotification: false});
                  }}>
                  <CloseIcon />
                </IconButton>,
              ]}
            />
          </div>
        </Grid>
      </Grid>
    );
  }
}

EditCompany.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditCompany);
